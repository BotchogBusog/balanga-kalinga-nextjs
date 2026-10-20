// Shared definition of the wellness check, used by both the modal UI and the API.

// The ten questions, each tagged with the "area" it measures (used for feedback).
export const QUESTIONS = [
  { text: "During the past four weeks, how often have you felt unusually tired without knowing the reason?", area: "Unusual tiredness" },
  { text: "How often have you experienced feelings of nervousness or anxiety?", area: "Nervousness or anxiety" },
  { text: "How often have you felt so nervous that it was difficult to calm yourself?", area: "Difficulty calming down" },
  { text: "How often have you felt hopeless about your situation or the future?", area: "Hopelessness" },
  { text: "How often have you experienced restlessness or difficulty relaxing?", area: "Restlessness" },
  { text: "How often have you felt so restless that you had difficulty sitting still?", area: "Difficulty sitting still" },
  { text: "How often have you experienced feelings of sadness or a persistently low mood?", area: "Low mood" },
  { text: "How often have you felt that completing your usual daily activities required too much effort?", area: "Daily activities" },
  { text: "How often have you experienced sadness that was difficult to ease, even when something positive happened?", area: "Persistent sadness" },
  { text: "How often have you experienced feelings of low self-worth or felt that you had little personal value?", area: "Low self-worth" },
];

// The five possible answers, each with a 1-5 score.
export const OPTIONS = [
  { value: 1, label: "None of the time — 1" },
  { value: 2, label: "A little of the time — 2" },
  { value: 3, label: "Some of the time — 3" },
  { value: 4, label: "Most of the time — 4" },
  { value: 5, label: "All of the time — 5" },
];
