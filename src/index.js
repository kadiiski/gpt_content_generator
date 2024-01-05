import topics from "./topics.js"
import {ChatGPTAPI} from "chatgpt";
import fs from "fs";
// Use https://www.gdoctohtml.com/ to convert the generated markdown to html.
// https://docs.google.com/document/d/1RdvUhx4p6DV5tRc15-TncKiIl1ze_sWsL8wpfCV5suw/edit#heading=h.5ptdbr316ida
const config = {
  useThemeIntro: 1,
  themeIntroLength: 5,
  useTopicIntro: 1,
  topicIntroLength: 3,
  useSubTopicIntro: 1,
  subTopicIntroLength: 3,
  subTopicLength: 10,
  gptKey: ""
}

console.log('CONFIG:', config)

const api = new ChatGPTAPI({
  apiKey: "your-api-key-here",
  completionParams: {
    model: 'gpt-4',
  }
})

const getGptTask = (track, theme, topic, subTopic) => {
  return `
  I will give you some topics and you must return a lecture plan for each and every topic. Each topic will be with title and sub topics.
  I will tell you weather to add an into to either the topic or the subtopics and how long to make it. 
  Based on the time duration I give you, you should make a script for a lecture specifically for the topics I'm giving you.
  You should also add as much examples as possible and don't count the examples in the time of the lecture. 
  
  The hierarchy we are using is Track -> Theme -> Topic -> Subtopic.
  
  Here is some context before we start:
  Track: "${track.name}"
  Theme: ${theme.name}"
  Topic: "${topic.name}"
  Subtopic: "${subTopic}"
  
  Now, give me the script for "${subTopic}". 
  Introduce the subtopic in ${config.subTopicIntroLength} minutes.
  Make the script ${config.subTopicLength} minutes long. 
  Make the script in markdown format.
  `
}

topics.map((track) => {
  track.themes.map(theme => {
    theme.topics.map(topic => {
      topic.subtopics.map(async subTopic => {
        const task = getGptTask(track, theme, topic, subTopic)
        console.log(task)

        console.log(`Sending to GPT ${subTopic}`)
        await api.sendMessage(task).then(response => {
          console.log(response.text)

          const dir = `./generated_content/${track.name}`

          // Create the directory if it doesn't exist.
          if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
          }

          const filename = `${dir}/${subTopic}.md`
          if (fs.existsSync(filename)) {
            // Deleting the file if it exists.
            fs.unlinkSync(filename)
          }

          fs.writeFileSync(filename, response.text)
        }).catch(err => {
          console.log(err)
        })

      })
    })
  })
})

