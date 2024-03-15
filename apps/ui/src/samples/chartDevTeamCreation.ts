export const CHART_DEV_TEAM_CREATION = {
    name: "team_creation",
    description: "Create Development Team Based on Requirement",
    flows: `
analyze_requirement:
  description: Analyze User Requirement
  type: llm
  context:
    entry: categorize_input
    module: custom_prompts
    toJSON: true
  inputs:
    message: "{{inputs.message}}"
find_developer:
  description: Find Developer
  type: retrieval
  context:
    toJSON: true
  inputs:
    query: "{{analyze_requirement.outputs.category + ' Developer, ' + inputs.message}}"
    category: developer
    count: 1
  deps:
  - analyze_requirement
find_tester:
  description: Find Tester
  type: retrieval
  context:
    toJSON: true
  inputs:
    query: "{{inputs.message}}"
    category: tester
    count: 1
  deps:
  - analyze_requirement
create_team_step:
  description: Form The Team
  type: llm
  context:
    entry: create_team_with_suggestion
    module: custom_prompts
    toJSON: true
  inputs:
    developer: "{{find_developer.outputs[0]}}"
    tester: "{{find_tester.outputs[0]}}"
    requirement: "{{inputs.message}}"
  deps:
  - find_developer
  - find_tester
merge_output_step:
  description: Merge Output
  type: function
  context:
    entry: merge_outputs
    module: default_functions
  inputs:
    team: "{{create_team_step.outputs}}"
    requirement: "{{inputs.message}}"
    developer: "{{find_developer.outputs[0]}}"
    tester: "{{find_tester.outputs[0]}}"
  deps:
  - create_team_step
generate_report_step:
  description: Generate Team Report
  type: function
  context:
    entry: generate_team_report
    module: custom_functions
  inputs:
    team: "{{merge_output_step.outputs.team}}"
    tester: "{{merge_output_step.outputs.tester}}"
    developer: "{{merge_output_step.outputs.developer}}"
    requirement: "{{merge_output_step.outputs.requirement}}"
  deps:
  - merge_output_step


    `.trim(),
    prompts: `
categorize_input: |
  SYSTEM:
  You are a helpful assistant that help to identify the requirement to the best category, by rules below:
  - if it is artificial intelligence or machine learning related, return category "AI"
  - else if it is web page related, return category "Web"
  - else if it is mobile related, return category "Mobile"
  - other front end requirements, return category "Frontend"
  - if it involves both frontend and backend with certain complexity, return category "Fullstack" 
  - if it is backend or server related, return category "Backend"
  - else if it is bitcoin or blockchain related, return category "Blockchain"

  The response should only be a JSON, for example:
  \`\`\`json
  {
    "category": "AI",
    "reason": "It is about machine learning"
  }
  \`\`\`

  USER:
  What is the category to '{{message}}'?

create_team_with_suggestion: |
  SYSTEM:
  You are a helpful assistant to creatively create nick name and one-sentence introduction for given team:

  ## Team Members
  - {{developer.description}}
  - {{tester.description}}

  ## Goal
  - Complete Requirement '{{requirement}}'.

  ## Rules
  - Team name could be one or two words, like domain or subject of the requirement or funny name.
  - Team introduction should be a one-sentence introduction, should be close to how to achieve the goal and catchy. If possible refer some of the member information.

  The response should only be a JSON, no explanation, as example below:
  \`\`\`json
  {
    "name": "Team name",
    "info": "Team introduction"
  }
  \`\`\`
  USER:
  What is the team name and introduction?
    `.trim(),
    datasets: `
developer: [
  '{"name": "Alex Johnson", "gender": "Male", "introduction": "Innovative software developer with a passion for AI.", "age": 29, "role": "Software Developer", "description": "Alex thrives on challenging coding marathons and is a green tea enthusiast."}',
  '{"name": "Daniela Ortiz", "gender": "Female", "introduction": "Frontend developer with a love for responsive design.", "age": 31, "role": "Frontend Developer", "description": "Daniela is a coffee aficionado who codes as beautifully as she paints."}',
  '{"name": "Raj Patel", "gender": "Male", "introduction": "Backend wizard focusing on scalable services.", "age": 37, "role": "Backend Developer", "description": "Raj enjoys learning docker, terraform and kubernetes."}',
  '{"name": "Yuto Nakamura", "gender": "Male", "introduction": "Mobile developer passionate about creating engaging apps.", "age": 25, "role": "Mobile Developer", "description": "Yuto is a manga collector who dreams of developing his own game app."}',
  '{"name": "Lucas Kim", "gender": "Male", "introduction": "Full-stack developer who juggles both front and back end with ease.", "age": 27, "role": "Fullstack Developer", "description": "Lucas is a culinary experimenter who believes in mixing flavors like coding languages."}',
  '{"name": "Leonardo Ferreira", "gender": "Male", "introduction": "Cybersecurity specialist protecting against digital threats.", "age": 41, "role": "Cybersecurity Specialist", "description": "Leonardo is a judo black belt, applying his discipline to cybersecurity."}',
  '{"name": "Tara Singh", "gender": "Female", "introduction": "Blockchain developer innovating in secure and transparent systems.", "age": 30, "role": "Blockchain Developer", "description": "Tara is an urban gardener, cultivating blockchain solutions and her rooftop garden with equal care."}',
  '{"name": "Anika Patel", "gender": "Female", "introduction": "Web developer creating seamless and interactive web experiences.", "age": 26, "role": "Web Developer", "description": "Anika is a yoga instructor, balancing flexibility in web design and her practice."}',
]
tester: [
  '{"name": "Samantha Lee", "gender": "Female", "introduction": "Dedicated QA engineer with an eye for detail.", "age": 34, "role": "QA Engineer", "description": "Samantha, a puzzle solver at heart, loves hiking and finding bugs not just in software."}',
  '{"name": "Michael Brown", "gender": "Male", "introduction": "Creative UX/UI designer who believes in simplicity.", "age": 26, "role": "UX/UI Designer", "description": "Michael sketches in his free time and dreams of designing a universally intuitive app interface."}',
  '{"name": "Elena Gomez", "gender": "Female", "introduction": "Project manager who steers projects with a calm and steady hand.", "age": 40, "role": "Project Manager", "description": "Elena is a strategic thinker and a weekend mountain biker."}',
  '{"name": "Tom Nguyen", "gender": "Male", "introduction": "Data analyst with a knack for uncovering insights through data.", "age": 28, "role": "Data Analyst", "description": "Tom plays the violin and uses data as his muse for melodies."}',
  '{"name": "Isabella Rossi", "gender": "Female", "introduction": "Cloud specialist devoted to building robust cloud infrastructures.", "age": 35, "role": "Cloud Specialist", "description": "Isabella is an amateur astronomer who finds parallels between stars and cloud computing."}',
  '{"name": "Haruto Takahashi", "gender": "Male", "introduction": "Security expert ensuring our digital world is safe and sound.", "age": 33, "role": "Security Expert", "description": "Haruto practices Kendo to sharpen his mind and protect digital realms."}',
  '{"name": "Sophie Martin", "gender": "Female", "introduction": "Technical writer who translates complex ideas into simple words.", "age": 27, "role": "Technical Writer", "description": "Sophie is a secret poet who finds rhythm in coding languages and nature."}',
  '{"name": "Carlos García", "gender": "Male", "introduction": "DevOps engineer automating processes for efficiency.", "age": 32, "role": "DevOps Engineer", "description": "Carlos loves the chaos of rock climbing as much as streamlining deployment pipelines."}',
  '{"name": "Fatima Zahra", "gender": "Female", "introduction": "AI researcher pushing the boundaries of machine learning.", "age": 29, "role": "AI Researcher", "description": "Fatima is a chess aficionado who sees life as a series of strategic moves."}',
  '{"name": "Olivia Smith", "gender": "Female", "introduction": "HR manager who cultivates a vibrant company culture.", "age": 38, "role": "HR Manager", "description": "Olivia is a yoga practitioner who believes in balance in life and work."}',
  '{"name": "Ethan Wright", "gender": "Male", "introduction": "Business analyst who bridges the gap between IT and business.", "age": 30, "role": "Business Analyst", "description": "Ethan cycles to work and strategizes as he pedals."}',
  '{"name": "Aisha Mohammed", "gender": "Female", "introduction": "Network engineer who keeps the company''s communication seamless.", "age": 34, "role": "Network Engineer", "description": "Aisha is a globe-trotter who collects postcards and solves network puzzles."}',
  '{"name": "Zoe Chan", "gender": "Female", "introduction": "Product manager who turns ideas into successful products.", "age": 36, "role": "Product Manager", "description": "Zoe is a marathon runner who approaches product development as a long-distance race."}',
  '{"name": "Amir Khan", "gender": "Male", "introduction": "Support technician who ensures everyone stays connected and productive.", "age": 29, "role": "Support Technician", "description": "Amir is a film buff who troubleshoots tech problems as if solving movie mysteries."}',
  '{"name": "Natalie DuBois", "gender": "Female", "introduction": "Sales executive with a talent for nurturing client relationships.", "age": 33, "role": "Sales Executive", "description": "Natalie is a jazz enthusiast who improvises in sales as smoothly as in music."}',
  '{"name": "Brian O''Connor", "gender": "Male", "introduction": "Agile coach passionate about driving team success and efficiency.", "age": 45, "role": "Agile Coach", "description": "Brian is an avid sailor, navigating the seas of software development with ease."}',
  '{"name": "Maya Krishnan", "gender": "Female", "introduction": "Database administrator who ensures data integrity and security.", "age": 39, "role": "Database Administrator", "description": "Maya is a tea connoisseur, blending the art of databases with her love for Darjeeling."}',
  '{"name": "Elijah Miller", "gender": "Male", "introduction": "Systems analyst who simplifies complex systems for user efficiency.", "age": 28, "role": "Systems Analyst", "description": "Elijah is a minimalist photographer, finding beauty in simplicity, both in work and art."}',
  '{"name": "Lena Baumgartner", "gender": "Female", "introduction": "Cloud engineer with a focus on scalable and resilient infrastructure.", "age": 33, "role": "Cloud Engineer", "description": "Lena is an alpine climber, scaling mountains and cloud architectures with equal zest."}',
  '{"name": "Andre Luiz", "gender": "Male", "introduction": "Machine learning engineer crafting algorithms to mimic human learning.", "age": 35, "role": "Machine Learning Engineer", "description": "Andre is a jazz pianist, improvising in music and machine learning."}',
  '{"name": "Sofia Ivanova", "gender": "Female", "introduction": "Quality assurance manager ensuring every product exceeds standards.", "age": 37, "role": "Quality Assurance Manager", "description": "Sofia is a master chess player, strategizing in games and software quality alike."}',
  '{"name": "Kai Wen", "gender": "Male", "introduction": "Embedded systems engineer designing software for hardware devices.", "age": 42, "role": "Embedded Systems Engineer", "description": "Kai is a drone racer, piloting through the skies and the challenges of embedded systems."}',
  '{"name": "Nora Fischer", "gender": "Female", "introduction": "User research analyst who uncovers what users truly need.", "age": 29, "role": "User Research Analyst", "description": "Nora is an indie filmmaker, crafting stories in film and user experiences."}',
  '{"name": "Ibrahim Al Farsi", "gender": "Male", "introduction": "Digital marketing specialist driving brand growth online.", "age": 34, "role": "Digital Marketing Specialist", "description": "Ibrahim is a street photographer, capturing the essence of cities and digital campaigns."}',
  '{"name": "Jing Wei", "gender": "Female", "introduction": "Artificial intelligence researcher exploring the frontiers of AI.", "age": 31, "role": "AI Researcher", "description": "Jing is a calligraphy artist, blending the art of brush strokes with AI innovations."}',
  '{"name": "Miguel Santos", "gender": "Male", "introduction": "IT consultant advising on the strategic use of technology.", "age": 38, "role": "IT Consultant", "description": "Miguel is an amateur astronomer, guiding companies through the tech universe with precision."}',
  '{"name": "Youssef Amir", "gender": "Male", "introduction": "Information security analyst safeguarding company data.", "age": 40, "role": "Information Security Analyst", "description": "Youssef is a historical fiction writer, protecting data with the narrative skill of a storyteller."}',
  '{"name": "Hannah Müller", "gender": "Female", "introduction": "Software architect designing robust software solutions.", "age": 36, "role": "Software Architect", "description": "Hannah is an avid cyclist, racing through software design with endurance and speed."}',
  '{"name": "Omar Khan", "gender": "Male", "introduction": "Network architect building and maintaining critical network infrastructures.", "age": 32, "role": "Network Architect", "description": "Omar is a gourmet chef, crafting networks with the precision of a culinary artist."}',
  '{"name": "Emily Wright", "gender": "Female", "introduction": "Product designer who shapes the future of user interfaces.", "age": 27, "role": "Product Designer", "description": "Emily is a competitive dancer, choreographing user experiences with grace and impact."}',
  '{"name": "Akiro Tanaka", "gender": "Male", "introduction": "Firmware engineer developing the low-level software for devices.", "age": 29, "role": "Firmware Engineer", "description": "Akiro is a bonsai enthusiast, nurturing plants and firmware with patience and precision."}',
  '{"name": "Isabel Rodriguez", "gender": "Female", "introduction": "Scrum master facilitating agile development for optimum productivity.", "age": 34, "role": "Scrum Master", "description": "Isabel is a mural painter, bringing together teams and art in colorful collaboration."}',
  '{"name": "Luke Harper", "gender": "Male", "introduction": "DevOps specialist focusing on automation and continuous integration.", "age": 32, "role": "DevOps Specialist", "description": "Luke is a vintage motorcycle enthusiast, fine-tuning engines and deployment pipelines with equal passion."}',
  '{"name": "Zara Abdullah", "gender": "Female", "introduction": "User interface designer crafting intuitive and beautiful digital experiences.", "age": 28, "role": "User Interface Designer", "description": "Zara is a muralist, blending colors and code to make the digital world more human-friendly."}',
  '{"name": "Derek Sun", "gender": "Male", "introduction": "Data scientist turning data into insights and actions.", "age": 30, "role": "Data Scientist", "description": "Derek is an urban explorer, finding patterns in both data and the hidden corners of cities."}',
  '{"name": "Priya Bhat", "gender": "Female", "introduction": "Software tester ensuring every release is bug-free and reliable.", "age": 27, "role": "Software Tester", "description": "Priya is a thrill-seeker, skydiving and debugging with the same level of excitement and precision."}',
  '{"name": "Jason Mireles", "gender": "Male", "introduction": "Infrastructure engineer building the backbone of our tech environment.", "age": 35, "role": "Infrastructure Engineer", "description": "Jason is a marathon runner, enduring long distances and complex system setups with determination."}',
  '{"name": "Nadia Kuznetsova", "gender": "Female", "introduction": "Front-end engineer bringing designs to life with code.", "age": 29, "role": "Front-end Engineer", "description": "Nadia is a classical pianist, composing melodies and websites with artistic flair."}',
  '{"name": "Erik Solheim", "gender": "Male", "introduction": "Business intelligence analyst transforming data into strategic business decisions.", "age": 34, "role": "Business Intelligence Analyst", "description": "Erik is a vintage chess set collector, strategizing in business and on the chessboard."}',
  '{"name": "Lily Tran", "gender": "Female", "introduction": "Technical support specialist who is the lifeline for clients in distress.", "age": 26, "role": "Technical Support Specialist", "description": "Lily is a gourmet cook, troubleshooting tech issues and complex recipes with ease."}',
  '{"name": "Emma Laurent", "gender": "Female", "introduction": "UX researcher dedicated to understanding and enhancing user satisfaction.", "age": 33, "role": "UX Researcher", "description": "Emma is a documentary filmmaker, uncovering stories in both user data and real life."}',
]
    `.trim(),
    functions: `
import { queryLLM, registerModule } from "default_functions";

const generate_team_report = async ({ requirement, team, developer, tester }) => {
  return {
    message : \`
Below is the summary of the team:

### Requirement
\${requirement}

### Team - '\${team.name}'
\${team.info}

### Developer
\${developer.name} - \${developer.role}

### Tester 
\${tester.name} - \${tester.role}
  \`.trim()
  };
};

// example for doing LLM query in function
const llm_query_by_function_example = async ({
  developer,
  tester,
  requirement,
}) => {
  let result = await queryLLM({
    query: \`
SYSTEM:
You are a helpful assistant to creatively create nick name and one-sentence introduction for given team:

## Team Members
- \${developer.description}
- \${tester.description}

## Goal
- Complete Requirement \\\`\${requirement}\\\`.

## Rules
- Team name could be one or two words, like domain or subject of the goal.
- Team introduction should be a one-sentence introduction, should be close to how to achieve the goal and catchy. If possible refer some of the member information.

The response should only be a JSON, no explanation, as example below:
\\\`\\\`\\\`json
{
  "name": "Team name",
  "info": "Team introduction"
}
\\\`\\\`\\\`
USER:
What is the team name and introduction?
  \`.trim(),
    toJSON: true,
  });

  return result;
};

// register functions
registerModule("custom_functions", {
  generate_team_report,
  llm_query_by_function_example,
});
    `.trim(),
}