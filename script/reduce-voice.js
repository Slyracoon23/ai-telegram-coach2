const voice_json = require('../public/voice.json');

const predictions =  voice_json[0].results.predictions[0].models.language.grouped_predictions[0].predictions;
const highestEmotionsPerSegment = [];

for (let i = 0; i < predictions.length; i++) {
    const groupedPredictions = predictions[i].grouped_predictions;
    for (let j = 0; j < groupedPredictions.length; j++) {
        const segments = groupedPredictions[j].predictions;
        for (let k = 0; k < segments.length; k++) {
            const segment = segments[k];
            let highestEmotion = null;
            let highestScore = 0;

            for (let l = 0; l < segment.emotions.length; l++) {
                const emotion = segment.emotions[l];
                if (emotion.score > highestScore) {
                    highestEmotion = emotion.name;
                    highestScore = emotion.score;
                }
            }

            highestEmotionsPerSegment.push({
                text: segment.text,
                highestEmotion: highestEmotion,
                score: highestScore
            });
        }
    }
}

console.log(highestEmotionsPerSegment);
