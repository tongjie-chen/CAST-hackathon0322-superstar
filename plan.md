
对象: 毕业生，和职业转型人士

解决问题：在做职业转型或者毕业生新人对职业的迷茫和无相关的工作经验

产品：我们想模拟一个企业规划导师，从职业选择和规划，确定岗位后进行确定的技能培训，工作经验积累和反馈。

Problem
Individuals undergoing career transitions and recent graduates often face confusion about career direction and lack relevant work experience.

Solution
We aim to build a simulated corporate career mentor platform that guides users through the entire career development process.
The platform will:
- Help users explore and choose suitable career paths 
- Provide structured career planning 
- Deliver targeted skill training based on selected roles 
- Offer simulated work experience to help users build practical experience 
- Provide continuous feedback to support improvement and growth 

Goal
To bridge the gap between career uncertainty and job readiness, enabling users to move from learning to real employment outcomes.


模块
1.职业选择： 性格测试，市场机会，职业选择报告，职业选择偏好；
2.技能培训：岗位JD，实习培训过程（包含任务下放，工作完成，交互反馈），验证审核
3. 面试：mock interview，resume，cover letter，Salary Negotiation


# Connect to AI API
The key is in .env file

# Assessment page
Pull from popular character assessment, make a page and generate results for the user and save it

# Career exploration
Make it a chat bot with AI API. The AI is in the role of a career coach.

After user interaction of choice or input of text, match the career with O*NET OnLine site with prompt to AI API, then gather the content from O*NET OnLine page and interprete.

# Skills Training
According to the choice of career, from the description from O*NET OnLine site, list skills in catetory.
- Give the training plan of 3 months, this can be customized
- Give timeline of training
- Give check in schedule, can be dowloaded as calendar or add to online calendars such as Google Calendar

# Interview Prep
Have sub sections of mock interview，resume，cover letter，salary negotiation.
* Mock interview, chat bot
* Resume, upload and get feedback from AI
* Cover letter, generate from AI and let the user edit on the webpage
* Salary negotiation, get salary range from online and suggest tips

# AI requirement
- [ ] Need to save the conversation locally, give a button to clear the conversation.
- [ ] Format AI API result with MD
- [ ] Generate Initial Draft button seems not using AI
- [ ] Salary Negotiation need to pull real data
- [ ] Script generator button not working seems

# Revamp
- [ ] Assessment should be saved to somewhere and the left lower badge shows the career choice
- [ ] Career Exploration, based on assessment, pull the market data and choices, then let the user select one career
- [ ] Training: pull a sample job description, let the user choose if it's an internship or career switch. If internship, pull a sample internship job from online, such as McKinsey's public case review for consulting, bank's research report, make an assignment for the user. Then prompt user to complete with a suggested timeline. After completion, give feedback

# Issues
- [x] "We matched you with Product Management. Select a specialization to deeply tailor your Coach" does not have a choice there. Need to query result from AI and then pop up a list of choices
- [x] "Download to Calendar" is not working yet
- [x] Roadmap timeline need to be adjusted to the career choice like previous mocked with specific data
- [x] Project simulator should have a third path of progressing to more senior role
- [ ] Interactive Project Simulator's assignment need to be pulled from online with help from AI API, such as McKinsey's public case review for consulting, bank's research report, make an assignment for the user. Then prompt user to complete with a suggested timeline. After completion, give feedback
- [ ] Roadmap timeline should have more specific data on what to study, pull the data from AI API
- [ ] Assessment need to be adaptable, right now it only gives result of PM
