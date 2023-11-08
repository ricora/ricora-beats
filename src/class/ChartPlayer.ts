import { type Chart } from "./Chart"
import { type KeySoundPlayer } from "./KeySoundPlayer"
import { Note } from "./Note"
import { Band } from "./Band"
import { Measure } from "./Measure"
import { JudgeMeter } from "./JudgeMeter"

import { type PlayConfig } from "./PlayConfig"

import bms from "bms"

type Key = 4 | 5 | 6 | 7
export class ChartPlayer {
  public lanes: Note[][] = []
  public bgmLane: Note[] = []
  public measures: Measure[] = []
  public longNoteBands: Band[][] = []

  public isHolds = new Array<boolean>(7).fill(false)

  public judges = new Array<number>(5).fill(0)

  public latestJudgeIndex = -1
  public latestJudgeSec = -1
  public latestJudgeDiff = 0

  public lastBeat: number = 4

  public judgeRanges: number[] = [25, 50, 75, 100, 150]
  public scoreCoefficients: number[] = [1, 0.9, 0.6, 0.2, 0]

  public combo: number = 0
  public maxCombo: number = 0

  public judgeMeters: JudgeMeter[]

  constructor(scene: Phaser.Scene, chart: Chart, key: Key, playConfig: PlayConfig) {
    for (const laneIndex of Array(7).keys()) {
      this.lanes[laneIndex] = []
      this.longNoteBands[laneIndex] = []
    }

    const replacementNormalNote: Record<number, number> = {
      11: 0,
      12: 1,
      13: 2,
      14: 3,
      15: 4,
      18: 5,
      19: 6,
    }

    const replacementLongNote: Record<number, number> = {
      51: 0,
      52: 1,
      53: 2,
      54: 3,
      55: 4,
      58: 5,
      59: 6,
    }

    const isLatestEndLongNote: boolean[] = new Array<boolean>(7).fill(false)
    const beatLatestEndLongNote: number[] = new Array<number>(7).fill(-1)

    for (const object of chart.bmsChart.objects._objects) {
      let laneIndex: number = replacementNormalNote[parseInt(object.channel)]
      const noteValue: number = parseInt(object.value, 36)
      let isLongNoteStart: boolean = false
      let isLongNoteEnd: boolean = false
      let isBGM: boolean = false
      const beat = chart.bmsChart.timeSignatures.measureToBeat(object.measure, object.fraction)

      if (parseInt(object.channel) in replacementLongNote) {
        laneIndex = replacementLongNote[parseInt(object.channel)]

        if (!isLatestEndLongNote[laneIndex]) {
          beatLatestEndLongNote[laneIndex] = beat
          isLongNoteStart = true
        } else {
          isLongNoteEnd = true
        }
        isLatestEndLongNote[laneIndex] = true
      }

      if (parseInt(object.channel) === 1) {
        isBGM = true
      }

      let noteImage: string = ""
      let longNoteImage: string = ""
      let displaySizeX: number = 0
      let displaySizeY: number = 0
      let positionX: number = 0
      let visible: boolean = true
      if (key == 4) {
        if (laneIndex >= 1 && laneIndex <= 2) {
          positionX = 361 + 186 * (laneIndex - 1)
        } else if (laneIndex >= 4 && laneIndex <= 5) {
          positionX = 361 + 186 * (laneIndex - 2)
        }
      } else if (key == 5) {
        if (laneIndex >= 1 && laneIndex <= 5) {
          positionX = 343 + 148.5 * (laneIndex - 1)
        }
      } else if (key == 6) {
        if (laneIndex <= 2) {
          positionX = 330 + 124 * laneIndex
        } else if (laneIndex >= 4) {
          positionX = 330 + 124 * (laneIndex - 1)
        }
      } else if (key == 7) {
        positionX = 322 + 106 * laneIndex
      }
      if (playConfig.noteType === "rectangle") {
        noteImage = "note-rectangle-1"
        longNoteImage = "longnote-1"

        displaySizeX = { 4: 214, 5: 170, 6: 139, 7: 119 }[key]
        displaySizeY = 40

        if (laneIndex == 1 || laneIndex == 5) {
          noteImage = "note-rectangle-2"
          longNoteImage = "longnote-2"
        } else if (laneIndex == 3) {
          noteImage = "note-rectangle-3"
          longNoteImage = "longnote-3"
        } else {
          noteImage = "note-rectangle-1"
          longNoteImage = "longnote-1"
        }
        visible = !isLongNoteEnd
      } else if (playConfig.noteType === "circle") {
        if (isLongNoteEnd || isLongNoteStart) {
          noteImage = "note-circle-3"
        } else {
          noteImage = "note-circle-1"
        }
        longNoteImage = "longnote-circle"
        displaySizeX = 100
        displaySizeY = 100
        visible = true
      }

      if (isLongNoteEnd && isLatestEndLongNote[laneIndex] && beatLatestEndLongNote[laneIndex] != beat) {
        isLatestEndLongNote[laneIndex] = false

        const band = new Band(
          beatLatestEndLongNote[laneIndex],
          beat,
          scene.add
            .image(positionX, -100, longNoteImage)
            .setDisplaySize(displaySizeX, 0)
            .setOrigin(0.5, 0)
            .setDepth(-1)
            .setAlpha(1),
        )

        this.longNoteBands[laneIndex].push(band)
        beatLatestEndLongNote[laneIndex] = -1
      }

      const note: Note = new Note(
        beat,
        bms.Timing.fromBMSChart(chart.bmsChart).beatToSeconds(beat),
        noteValue,
        scene.add
          .image(positionX, -100, noteImage)
          .setDisplaySize(displaySizeX, displaySizeY)
          .setDepth(1)
          .setVisible(visible),
        isBGM,
        false,
        isLongNoteStart,
        isLongNoteEnd,
      )

      if (isBGM) {
        this.bgmLane.push(note)
      } else if (laneIndex >= 0 && laneIndex <= 7) {
        this.lanes[laneIndex].push(note)
        this.lastBeat = Math.max(this.lastBeat, beat)
      }
    }
    for (const laneIndex of Array(7).keys()) {
      this.lanes[laneIndex].sort((a, b) => a.beat - b.beat)
    }
    this.bgmLane.sort((a, b) => a.beat - b.beat)
    this.lastBeat += 0.1

    // measure
    for (const measureIndex of Array(1000).keys()) {
      this.measures.push(
        new Measure(
          chart.bmsChart.timeSignatures.measureToBeat(measureIndex, 0),
          scene.add.rectangle(640, -10, 747, 2, 0x999999).setDepth(-3),
        ),
      )
    }

    // judge meter
    this.judgeMeters = []
  }

  public update(
    scene: Phaser.Scene,
    beat: number,
    playingSec: number,
    noteSpeed: number,
    keySoundPlayer: KeySoundPlayer,
  ) {
    for (const note of this.bgmLane) {
      if (note.sec < playingSec) {
        if (!note.isJudged) {
          note.isJudged = true
          keySoundPlayer.playKeySound(scene, note.value.toString())
        }
      } else {
        break
      }
    }
    for (const measure of this.measures) {
      measure.rectangle.y = 640 + (beat - measure.beat) * noteSpeed
      if (measure.rectangle.y >= 640) {
        measure.rectangle.setVisible(false)
      }
    }

    for (const laneIndex of Array(7).keys()) {
      for (const band of this.longNoteBands[laneIndex]) {
        band.image.displayHeight = Math.max(
          (band.endBeat - band.startBeat + Math.min(band.startBeat - beat, 0)) * noteSpeed,
          0,
        )
        band.image.y = 640 + Math.min((beat - band.endBeat) * noteSpeed, 0)
      }

      for (const [noteIndex, note] of this.lanes[laneIndex].entries()) {
        note.image.y = 640 + Math.min((beat - note.beat) * noteSpeed, 0)
        if (
          !note.isJudged &&
          ((!note.isLongEnd && note.sec + this.judgeRanges.slice(-1)[0] / 1000 < playingSec) ||
            (note.isLongEnd && note.sec < playingSec))
        ) {
          note.isJudged = true
          note.image.visible = false
          this.isHolds[laneIndex] = false

          let judgeIndex: number
          if (note.isLongEnd) {
            judgeIndex = 0
            this.lanes[laneIndex][noteIndex - 1].isLongStart = false
          } else {
            judgeIndex = this.judgeRanges.length - 1
          }
          this.judges[judgeIndex]++

          this.latestJudgeIndex = judgeIndex
          this.latestJudgeSec = playingSec
          this.latestJudgeDiff = -this.judgeRanges.slice(-1)[0]

          if (note.isLongStart) {
            this.lanes[laneIndex][noteIndex + 1].isJudged = true
            this.lanes[laneIndex][noteIndex + 1].image.visible = false
            this.judges[judgeIndex]++
            this.combo++
            for (const band of this.longNoteBands[laneIndex]) {
              if (band.startBeat == note.beat) {
                band.image.visible = false
                break
              }
            }
          }
          if (judgeIndex <= 2) {
            this.combo++
          } else {
            this.maxCombo = Math.max(this.combo, this.maxCombo)
            this.combo = 0
          }
        }
      }
    }
    for (const judgeMeter of this.judgeMeters) {
      judgeMeter.update()
    }
  }

  public judgeKeyDown = (
    scene: Phaser.Scene,
    playingSec: number,
    laneIndex: number,
    keySoundPlayer: KeySoundPlayer,
  ): boolean => {
    for (const note of this.lanes[laneIndex]) {
      for (const [judgeIndex, judgeRange] of this.judgeRanges.entries()) {
        if (
          !note.isJudged &&
          !note.isLongEnd &&
          note.sec - judgeRange / 1000 <= playingSec &&
          playingSec <= note.sec + judgeRange / 1000
        ) {
          note.isJudged = true
          note.image.visible = false
          this.judges[judgeIndex]++
          if (judgeIndex <= 2) {
            this.combo++
          } else {
            this.maxCombo = Math.max(this.combo, this.maxCombo)
            this.combo = 0
          }

          this.latestJudgeIndex = judgeIndex
          this.latestJudgeSec = playingSec
          this.latestJudgeDiff = note.sec - playingSec
          this.judgeMeters.push(new JudgeMeter(scene, this.latestJudgeDiff))
          keySoundPlayer.playKeySound(scene, note.value.toString())

          if (note.isLongStart) {
            this.isHolds[laneIndex] = true
          }

          return true
        }
      }
    }
    return false
  }

  public judgeKeyHold = (playingSec: number, laneIndex: number) => {
    this.isHolds[laneIndex] = false
    for (const note of this.lanes[laneIndex]) {
      if (!note.isJudged && note.isLongEnd) {
        note.isJudged = true
        note.image.visible = false
        let judgeIndex: number = this.judgeRanges.length - 1
        for (const [i, judgeRange] of this.judgeRanges.entries()) {
          if (note.sec - judgeRange / 1000 <= playingSec && playingSec <= note.sec + judgeRange / 1000) {
            judgeIndex = i
            break
          }
        }

        this.judges[judgeIndex]++
        if (judgeIndex <= 2) {
          this.combo++
        } else {
          this.maxCombo = Math.max(this.combo, this.maxCombo)
          this.combo = 0
        }
        this.latestJudgeIndex = judgeIndex
        this.latestJudgeSec = playingSec
        this.latestJudgeDiff = note.sec - playingSec
        for (const band of this.longNoteBands[laneIndex]) {
          if (band.endBeat == note.beat) {
            band.image.visible = false
            break
          }
        }
        return
      }
    }
  }

  public hasFinished(beat: number): boolean {
    return beat > this.lastBeat
  }

  public get score(): number {
    let score = 0
    let maxScore = 0
    for (const judgeIndex of Array(5).keys()) {
      maxScore += this.judges[judgeIndex]
    }
    for (const judgeIndex of Array(5).keys()) {
      score += this.judges[judgeIndex] * this.scoreCoefficients[judgeIndex]
    }
    if (maxScore === 0) {
      maxScore = 1
    }

    return (score / maxScore) * 100
  }
}
