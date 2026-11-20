import { execFileSync } from 'node:child_process';
import { lstatSync, mkdtempSync, readFileSync, realpathSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repository = fileURLToPath(new URL('../', import.meta.url));
const buildDirectory = join(repository, 'build');
const siteDomain = 'moko-islandevolution.com';
const siteUrl = `https://${siteDomain}/`;
const pagesBranch = 'gh-pages';
const [option, ...extraOptions] = process.argv.slice(2);

function git(args, { capture = false } = {}) {
  return execFileSync('git', args, {
    cwd: repository,
    encoding: 'utf8',
    stdio: capture ? ['ignore', 'pipe', 'inherit'] : 'inherit'
  })?.trim();
}

function prepareBuild() {
  const npmCli = process.env.npm_execpath;
  if (!npmCli) throw new Error('Utilisez npm run publish:pages.');

  const env = { ...process.env, VITE_SITE_URL: siteUrl };
  for (const task of ['check', 'test', 'build']) {
    execFileSync(process.execPath, [npmCli, 'run', task], {
      cwd: repository,
      env,
      stdio: 'inherit'
    });
  }

  for (const file of ['index.html', 'sitemap.xml', '.nojekyll', 'CNAME']) {
    if (!lstatSync(join(buildDirectory, file), { throwIfNoEntry: false })?.isFile()) {
      throw new Error(`Fichier requis absent du build : ${file}`);
    }
  }
  if (!lstatSync(join(buildDirectory, '_app'), { throwIfNoEntry: false })?.isDirectory()) {
    throw new Error('Dossier requis absent du build : _app/');
  }
  const cname = readFileSync(join(buildDirectory, 'CNAME'), 'utf8').replace(/\r?\n$/, '');
  if (cname !== siteDomain) {
    throw new Error(`build/CNAME doit contenir une seule ligne : ${siteDomain}`);
  }
}

function publishBuild() {
  const origin = git(['remote', 'get-url', '--push', 'origin'], { capture: true });
  const source = git(['rev-parse', 'HEAD'], { capture: true });
  const tempRoot = realpathSync(tmpdir());
  const checkout = mkdtempSync(join(tempRoot, 'island-evolution-pages-'));

  try {
    git([
      'clone',
      '--no-checkout',
      '--single-branch',
      '--branch',
      pagesBranch,
      '--depth',
      '1',
      '--no-tags',
      '--',
      origin,
      checkout
    ]);
    const remoteGit = ['-C', checkout];
    const hasCname = git([...remoteGit, 'ls-tree', '--name-only', 'HEAD', '--', 'CNAME'], {
      capture: true
    });
    if (!hasCname || git([...remoteGit, 'show', 'HEAD:CNAME'], { capture: true }) !== siteDomain) {
      throw new Error(`Configurez d’abord ${siteDomain} dans GitHub Pages pour ${pagesBranch}.`);
    }

    // Le clone fournit le commit parent et un index vide. Le build forme tout le nouvel arbre Git.
    const buildTree = [
      '-C',
      buildDirectory,
      `--git-dir=${join(checkout, '.git')}`,
      `--work-tree=${buildDirectory}`
    ];
    git([...buildTree, '-c', 'core.autocrlf=false', 'add', '--all', '--force', '--', '.']);

    if (!git([...buildTree, 'diff', '--cached', '--name-only'], { capture: true })) {
      console.log('Le build est déjà présent sur origin/gh-pages.');
      return;
    }

    const name = git(['config', '--get', 'user.name'], { capture: true });
    const email = git(['config', '--get', 'user.email'], { capture: true });
    git([
      ...buildTree,
      '-c',
      `user.name=${name}`,
      '-c',
      `user.email=${email}`,
      'commit',
      '-m',
      `deploy: publish Pages from ${source}`
    ]);
    git(['-C', checkout, 'push', '--no-follow-tags', 'origin', `HEAD:refs/heads/${pagesBranch}`]);
    console.log('Build poussé sur origin/gh-pages. Vérifiez le déploiement dans GitHub Pages.');
  } finally {
    if (dirname(realpathSync(checkout)) !== tempRoot) {
      throw new Error('Le clone de publication se trouve en dehors du répertoire temporaire.');
    }
    rmSync(checkout, { recursive: true, maxRetries: 3 });
  }
}

try {
  if ((option !== '--check-only' && option !== '--publish') || extraOptions.length) {
    throw new Error('Usage : npm run publish:pages -- <--check-only | --publish>');
  }
  prepareBuild();
  console.log(
    `Build de production vérifié pour ${siteUrl} : index.html, _app/, sitemap.xml, .nojekyll et CNAME.`
  );
  if (option === '--publish') publishBuild();
} catch (error) {
  console.error(`GitHub Pages : ${error.message}`);
  process.exitCode = 1;
}
