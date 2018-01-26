const Tone = require('tone');
const jscad = require('@jscad/openjscad');
const fs = require('fs');
const FileSaver = require('file-saver');

const SAME_NOTE_INTERVAL = 1; // 同一个音不能相距小于1秒，不然音片打击出问题
// const mbox = new Tone.Sampler({
//   C4: 'C4.[mp3|ogg]',
//   'D#4': 'Ds4.[mp3|ogg]',
//   'F#4': 'Fs4.[mp3|ogg]',
//   A4: 'A4.[mp3|ogg]',
//   C5: 'C5.[mp3|ogg]',
//   'D#5': 'Ds5.[mp3|ogg]',
//   'F#5': 'Fs5.[mp3|ogg]',
//   A5: 'A5.[mp3|ogg]',
//   C6: 'C6.[mp3|ogg]',
// }, {
//   release: 1,
//   baseUrl: '../assets/audio/',
// }).toMaster();
const mbox = new Tone.AMSynth({ harmonicity: 6 }).toMaster();
export function buildModel(items) {
  console.log('== Enter RealMagic ==');
  // console.log(JSON.stringify(items));
  const tasksObj = {};
  items.forEach((item) => {
    //* 2 cuz print mbox need 1 octave higher.
    const itemNoteFreq = parseInt(Tone.Frequency(item.note).toFrequency() * 2, 10);
    if (!tasksObj[itemNoteFreq]) { tasksObj[itemNoteFreq] = []; }
    tasksObj[itemNoteFreq].push(item.time);
  });
  // tasksObj is like {784:[1.0295,1.39,2.6713],659:[2.66],...}

  // then we focus on each task
  const taskTypes = Object.keys(tasksObj); // [659,784,...]  freq array, 排好序的（object.keys）
  const taskTimeArrays = Object.values(tasksObj); // [[2.66]，[1.0295,1.39,2.6713]] 顺序跟上面对应的
  const machines = []; // init with existing types, will add more machines
  const groups = []; // will final be [[1],[1,2,1],...], corespond to taskTimeArrays

  if (taskTypes.length > 18) {
    alert('音种类超过18个，这个做不了');
    return false;
  }

  taskTimeArrays.forEach((timeArray) => {
    const final = [];
    timeArray.forEach((time, j) => {
      const test = []; // 校验当前final里不能用的序号， final里序号种类和test种类相同则证明不行
      let allPreviousOccupied = false;
      let successFound = false;
      if (j === 0) {
        final.push(1); // 给第1组的第一个任务分配第一个机器
      } else {
        let counter = j;
        while (counter >= 1 && !allPreviousOccupied) { // TODO: -1 or 0
          counter -= 1;
          if ((time - timeArray[counter] >= SAME_NOTE_INTERVAL)
          && test.indexOf(final[counter]) === -1) {
            final.push(final[counter]);
            successFound = true;
            break;
          } else if (test.indexOf(final[counter]) === -1) {
            test.push(final[counter]);
            if ([...new Set(final)].length === [...new Set(test)].length) {
              // final目前已有的都不满足，set可以取unique elements [1,1,2,2,3,1] => [1,2,3]
              allPreviousOccupied = true;
              break;
            }
          }
        }
        if ((counter === 0 && !successFound) || allPreviousOccupied) {
          final.push(Math.max(...final) + 1);
        }
      }
    });
    groups.push(final);
  });
  // console.log(taskTypes);
  // console.log(taskTimeArrays);
  // console.log('hehe', groups); // [[1],[1,2,1],...], corespond to taskTimeArrays

  // now we have groups, let's build machines based on this
  groups.forEach((group, index) => {
    let count = 0;
    while (count <= Math.max(...group) - 1) {
      machines.push(taskTypes[index]);
      count += 1;
    }
  });
  if (machines.length < 18) {
    const lastMachine = machines[machines.length - 1];
    while (machines.length < 18) {
      machines.push(lastMachine); // make it length of 18
    }
    // machines is like ["1046", "1174", "1318", "1318", "1318", "1396", "1567"] of 18 length
  } else if (machines.length > 18) {
    alert('所需音片儿超过18个');
    return false;
  }
  console.log(machines);
  // then we merge all the tasks

  // test1: [[1],[1,2,1]] => [1,2,3,2]
  // test2: [[1,2,1],[1,2,3]] => [1,2,1,3,4,5]
  const finalBins = groups.reduce((a, b) => a.concat(b.map(item => item + Math.max(...a))));
  let finalTimings = taskTimeArrays.reduce((a, b) => a.concat(b)); // just flatten it
  finalTimings = finalTimings.map(item => (item * 15) / 20); // normalize from 20s to 15s
  const musicboxPins = finalBins.map((bin, index) => `generatePin(${finalTimings[index]},${bin})`);
  const script = `
    //底下低音,上面高音
  const DOT_WIDTH = 0.6
  const RATIO = 0.98
  const OFFSET = 2.2 //1.95 is center
  const OUTER_RADIUS = 6.6
  const INNER_RADIUS = 5.9
  function generatePin(noteSec, noteNo) {
    return rotate(90, [1, 0, 4 * noteSec * RATIO / 15], cylinder({
      h: 1,
      r: DOT_WIDTH / 2,
      center: true
    })).translate([sin(360 * noteSec * RATIO / 15) * OUTER_RADIUS, -cos(360 * noteSec * RATIO / 15) * OUTER_RADIUS, -9.95 + OFFSET + 0.4 + (noteNo - 1) * .9])
  }

  function main() {
    let cylinderBody = difference(cylinder({h: 19.9,r: OUTER_RADIUS,center: true}),cylinder({h: 19.9,r: INNER_RADIUS,center: true}))
    let holes = union(${musicboxPins})
    return union(cylinderBody,holes).translate([0, 0, 0]).scale(1);
  }`;
  // console.log(script);
  const params = {};
  jscad.compile(script, params).then((compiled) => {
  // generate final output data, choosing your prefered format
    const outputData = jscad.generateOutput('stlb', compiled);
    // hurray ,we can now write an stl file from our OpenJsCad script!
    FileSaver.saveAs(outputData, 'mb.stl');
    // fs.writeFileSync('mb.stl', outputData.asBuffer());
  });
}
export function preview(items) {
  new Tone.Part(((time, value) => {
    mbox.triggerAttackRelease(value.note, '8n', time);
  }), items).start(0);
  Tone.Transport.start('+0.01', 0);
}
