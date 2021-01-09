const app = new Vue({
  el: '.app',
  data: {
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
    onPlay: 0,
    status: [],
    timeLine: null,
    hit: 0,
  },
  methods: {
    setFinishTime(id, time) {
      setTimeout(() => {
        this.status[id][1] = time
        console.log('set time')
      }, 200)
    },
    touch(e) {
      var sound = new Howl({
        src: ['hit.wav']
      })
      sound.play()
      let x = e.touches[0].clientX
      let y = e.touches[0].clientY
      let min = 100
      let target = -1
      let nowTime = this.timeLine.time() * 1000
      document.querySelectorAll('.note').forEach(note => {
        let noteX = note.getClientRects()[0].x
        let noteY = note.getClientRects()[0].y
        let noteId = note.getAttribute('data-id')
        let noteTime = this.status[noteId][1]
        let lx = Math.abs(noteX - x)
        let length = Math.sqrt((noteX - x) * (noteX - x) + (noteY - y) * (noteY - y))
        if (length < min && noteTime != -1) {
          min = length
          target = noteId
        }
      })
      if (target != -1) {
        console.log('当前最近目标：' + target)
        console.log('当前差值：' + Math.abs(nowTime - this.status[target][1] - 528))
        if (Math.abs(nowTime - this.status[target][1] - 528) < 100) {
          console.log('命中目标：' + target)
          this.status[target][1] = -1
          this.hit++
        }
      }
    }
  },
  mounted() {
    // 注册组件
    gsap.registerPlugin(MotionPathPlugin)
    // 初始化参数
    let dropTime = 1
    let h = document.body.clientHeight * 0.86 - 40
    let w = document.body.clientWidth
    // 初始化音符
    this.status = Array(this.text.trim().split('\n').length).fill([])
    this.status.forEach((e, index) => {
      this.status[index] = [index, -1]
    })

    // this.$nextTick(() => {
    //   function test() {
    //     console.log('finish~')
    //   }
    //   gsap.to(this.$refs['note' + 1][0], {
    //     onComplete: this.test,
    //     onCompleteParams: [1, 2],
    //     duration: 2,
    //     ease: 'none',
    //     x: 500,
    //     y: 300
    //   })
    // })

    // 初始化时间轴
    this.timeLine = gsap.timeline({ paused: true })
    this.$nextTick(() => {
      this.text.trim().split('\n').forEach((noteText, id) => {
        let note = noteText.split('|')
        note.forEach((item, index) => {
          let info = item.split(',')
          if (index == 0) {
            this.timeLine.add(gsap.fromTo(this.$refs['note' + id][0], {
              x: info[1] / 960 * w,
              y: -40
            }, {
              onStart: this.setFinishTime,
              onStartParams: [id, info[0]],
              duration: dropTime,
              ease: 'none',
              x: info[1] / 960 * w,
              y: h
            }), info[0] * 0.001 - dropTime)
          } else {
            let last = note[index - 1].split(',')
            let lastX = parseInt(last[1])
            let x = parseInt(info[2])
            this.timeLine.add(gsap.to(this.$refs['note' + id][0], {
              onStart: this.setFinishTime,
              onStartParams: [id, info[0]],
              motionPath: {
                path: [
                  // {x: last[1], y: 500},
                  {x: (lastX + ((x - lastX) / 2)) / 960 * w, y: h - info[1] / 540 * h},
                  {x: x / 960 * w, y: h}
                ]
              },
              duration: (info[0] - last[0]) * 0.001,
              ease: 'none',
            }), last[0]* 0.001)
          }
          if (index == note.length - 1) {
            this.timeLine.add(gsap.to(this.$refs['note' + id][0], {
              onStart: this.setFinishTime,
              onStartParams: [id, -1],
              duration: 0.2,
              alpha: 0
            }), info[0] * 0.001)
            // setTimeout(() => {
            //   this.$refs['note' + (id + 1)][0].remove()
            // }, 3200 + parseInt(info[0]))
          }
        })
      })
      // audio = "audio.mp3"
      // audio = new Audio(audio)
      // audio.addEventListener("canplay", () => {
      //   audio.play()
      //   this.timeLine.play()
      // })
      // setTimeout(() => {
      //   audio.play()
      //   this.timeLine.play()
        // timeLine.timeScale(0.1)
        // setTimeout(() => {
        //   timeLine.timeScale(1.9)
        //   setTimeout(() => {
        //     timeLine.timeScale(1)
        //   }, 300)
        // }, 300)
      // }, 3000)
      var sound = new Howl({
        src: ['audio.mp3']
      });
      
      // Clear listener after first call.
      sound.once('load', () => {
        sound.play();
        this.timeLine.play()
      });
    })
    document.onkeyup = e => {
      const key = window.event.keyCode
      if (key == 32) {
        if (!this.onPlay) {
          this.timeLine.timeScale(0.2)
          this.timeLine.play()

        } else {
          this.timeLine.pause()
        }
        this.onPlay = !this.onPlay
      }
    }
  }
})