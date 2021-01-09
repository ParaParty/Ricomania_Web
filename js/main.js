const app = new Vue({
  el: '.app',
  data: {
    onPlay: 0,
    player: null,
    noteList: [
      //时间ms 终点X [时间ms 跳跃高度 跳跃终点]*N
    ],
    text:
`
472,100|2347,500,500
706,200|2581,500,600
940,300|2815,500,700
1175,400|3050,500,800
1409,800|3284,500,400
1643,700|3518,500,300
1878,600|3753,500,200
2112,500|3987,500,100
4222,100|6097,500,500
4456,200|6331,500,600
4690,300|6565,500,700
4925,400|6800,500,800
5159,800|7034,500,400
5393,700|7268,500,300
5628,600|7503,500,200
5862,500|7737,500,100
`,
    itemList: 0
  },
  methods: {

  },
  mounted() {
    gsap.registerPlugin(MotionPathPlugin);
    let dropTime = 1
    // 初始化音符
    let timeLine = gsap.timeline({ paused: true })
    this.itemList = this.text.trim().split('\n').length
    this.$nextTick(() => {
      this.text.trim().split('\n').forEach((noteText, id) => {
        let note = noteText.split('|')
        note.forEach((item, index) => {
          let info = item.split(',')
          if (index == 0) {
            timeLine.add(gsap.fromTo(this.$refs['note' + (id + 1)][0], {
              x: info[1],
              y: -40
            }, {
              duration: dropTime,
              ease: 'none',
              x: info[1],
              y: 500
            }), info[0] * 0.001 - dropTime)
          } else {
            let last = note[index - 1].split(',')
            let lastX = parseInt(last[1])
            let x = parseInt(info[2])
            timeLine.add(gsap.to(this.$refs['note' + (id + 1)][0], {
              motionPath: {
                path: [
                  // {x: last[1], y: 500},
                  {x: lastX + ((x - lastX) / 2), y: 500 - info[1]},
                  {x: x, y: 500}
                ]
              },
              duration: (info[0] - last[0]) * 0.001,
              ease: 'none',
            }), last[0]* 0.001)
          }
          if (index == note.length - 1) {
            timeLine.add(gsap.to(this.$refs['note' + (id + 1)][0], {
              duration: 0.2,
              alpha: 0
            }), info[0] * 0.001)
          }
        })
      })
    })
    // 初始化波形图
    this.player = WaveSurfer.create({
      container: '.player',
      height: 100,
      scrollParent: true,
      plugins: [
        WaveSurfer.cursor.create({
            showTime: true,
            opacity: 1,
            barGap: 5,
            customShowTimeStyle: {
                'background-color': '#000',
                color: '#fff',
                padding: '2px',
                'font-size': '10px'
            }
        })
    ]
    })
    this.player.load('audio.mp3')
    this.player.zoom(50)
    this.player.on('seek', () => {
      timeLine.time(this.player.getCurrentTime())
    })
    // 控制播放
    document.onkeyup = e => {
      const key = window.event.keyCode
      if (key == 32) {
        this.player.playPause()
        this.onPlay = !this.onPlay
        if (this.onPlay) {
          timeLine.play()
        } else {
          timeLine.pause()
        }
      }
    }
  }
})