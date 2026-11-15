// Node2D/Sprite → SpriteFrames_7fmte dans player_reference.tscn.
// Clés AnimationPlayer : [temps en ms, index dans frames].
export const mokoAnimations = {
  climb_coco: {
    fps: 5, loop: true,
    render: {"scale":0.8897560975609757,"x":0.07009756097560971,"y":0.16780487804878041},
    frames: [
      {"path":"astra/MOKO_3D/climb_coco.png","rect":[0,0,320,320],"sheet":{"width":1920,"height":320},"durationMs":200},
      {"path":"astra/MOKO_3D/climb_coco.png","rect":[320,0,320,320],"sheet":{"width":1920,"height":320},"durationMs":200},
      {"path":"astra/MOKO_3D/climb_coco.png","rect":[640,0,320,320],"sheet":{"width":1920,"height":320},"durationMs":200},
      {"path":"astra/MOKO_3D/climb_coco.png","rect":[960,0,320,320],"sheet":{"width":1920,"height":320},"durationMs":200},
      {"path":"astra/MOKO_3D/climb_coco.png","rect":[1280,0,320,320],"sheet":{"width":1920,"height":320},"durationMs":200},
      {"path":"astra/MOKO_3D/climb_coco.png","rect":[1600,0,320,320],"sheet":{"width":1920,"height":320},"durationMs":200}
    ],
    animationPlayer: {"durationMs":1200,"loopMode":1,"keys":[[0,0],[200,1],[400,2],[600,3],[799.99995,4],[999.99994,5]]}
  },
  climb_liana: {
    fps: 5, loop: true,
    render: {"scale":0.8248337028824834,"x":0.06255543237250555,"y":0.22322616407982265},
    frames: [
      {"path":"astra/MOKO_3D/climb_liana.png","rect":[0,0,320,320],"sheet":{"width":320,"height":320},"durationMs":200}
    ],
    animationPlayer: {"durationMs":200,"loopMode":0,"keys":[[0,0]]}
  },
  idle: {
    fps: 5, loop: false,
    render: {"scale":0.832520325203252,"x":0.07739837398373978,"y":0.2666666666666667},
    frames: [
      {"path":"astra/MOKO_3D/idle.png","rect":[0,0,320,320],"sheet":{"width":1280,"height":320},"durationMs":200},
      {"path":"astra/MOKO_3D/idle.png","rect":[320,0,320,320],"sheet":{"width":1280,"height":320},"durationMs":200},
      {"path":"astra/MOKO_3D/idle.png","rect":[640,0,320,320],"sheet":{"width":1280,"height":320},"durationMs":200},
      {"path":"astra/MOKO_3D/idle.png","rect":[960,0,320,320],"sheet":{"width":1280,"height":320},"durationMs":200}
    ],
    animationPlayer: {"durationMs":3500,"loopMode":1,"keys":[[0,0],[480,1],[940,2],[1360,3],[1850,2],[2400,1],[2820,3],[3270,2]]}
  }
} as const;
