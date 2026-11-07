/**
 * Helper-facing WhatsApp copy in English, Hindi and Marathi (PS-020, PS-110, PS-105, 15 localisation).
 * Written for low literacy: short sentences, one action each.
 * NOTE: draft translations; have a native speaker review before the pilot.
 */
import type { Lang } from './store';

export const HELPER_TEXT: Record<Lang, {
  chooseLang: string; consent: (helper: string, owner: string, pet: string) => string; yes: string; notNow: string; declined: (owner: string) => string;
  method: string; photo: string; voice: string; missedCall: string; methodSet: string;
  prompt: (time: string, pet: string, task: string) => string; promptPhotoHint: string; sendPhotoCode: string; sendPhotoNoCode: string; resendOld: string; sendVoice: string;
  thanks: string; late: string; problem: string; hurt: string; sick: string; bit: string; foodOut: string; alerted: string;
  points: (pts: number, streak: number, visits: number) => string; myPoints: string; shareRecord: string; shareOff: string; stop: string; stopped: string;
}> = {
  en: {
    chooseLang: 'Choose your language',
    consent: (h, o, p) => `Hi ${h}! ${o} invited you to Pawsure to share ${p}'s care updates.\n• Your work gets a record.\n• Only the bowl or the pet, never your face.\n• You can stop any time.`,
    yes: 'Yes', notNow: 'Not now',
    declined: (o) => `No problem. Nothing will be recorded. ${o} has been told.`,
    method: 'How would you like to check in?', photo: 'Photo', voice: 'Voice note', missedCall: 'Missed call',
    methodSet: 'Done. You can change this any time by replying here.',
    prompt: (t, p, task) => `${t} · ${p}: ${task}`,
    promptPhotoHint: "Send a photo of the bowl with today's code from the food-box card.",
    sendPhotoCode: 'Photo with code', sendPhotoNoCode: 'Photo, no code', resendOld: 'Resend old photo', sendVoice: 'Voice note',
    thanks: 'Thank you! Recorded.', late: 'Thank you. Recorded as late.',
    problem: 'Report a problem', hurt: 'Hurt', sick: 'Sick', bit: 'Bit someone', foodOut: 'Food/water ran out',
    alerted: 'The owner and backup have been told. Emergency card:',
    points: (pts, s, v) => `This week: ${pts} points · ${s}-day streak · ${v} verified visits. 500 points = ₹20 coupon.`,
    myPoints: 'My points', shareRecord: 'Share my record', shareOff: 'Sharing your record is not switched on yet.', stop: 'Stop', stopped: 'Stopped. Nothing more will be collected.',
  },
  hi: {
    chooseLang: 'अपनी भाषा चुनें',
    consent: (h, o, p) => `नमस्ते ${h}! ${o} ने आपको ${p} की देखभाल की जानकारी भेजने के लिए Pawsure पर बुलाया है।\n• आपके काम का रिकॉर्ड बनेगा।\n• सिर्फ़ कटोरी या पालतू की फ़ोटो, आपका चेहरा कभी नहीं।\n• आप कभी भी बंद कर सकती हैं।`,
    yes: 'हाँ', notNow: 'अभी नहीं',
    declined: (o) => `कोई बात नहीं। कुछ भी दर्ज नहीं होगा। ${o} को बता दिया गया है।`,
    method: 'आप कैसे बताना चाहेंगी?', photo: 'फ़ोटो', voice: 'वॉइस नोट', missedCall: 'मिस्ड कॉल',
    methodSet: 'हो गया। आप यहाँ जवाब देकर कभी भी बदल सकती हैं।',
    prompt: (t, p, task) => `${t} · ${p}: ${task}`,
    promptPhotoHint: 'आज के कोड के साथ कटोरी की फ़ोटो भेजें।',
    sendPhotoCode: 'कोड के साथ फ़ोटो', sendPhotoNoCode: 'बिना कोड फ़ोटो', resendOld: 'पुरानी फ़ोटो', sendVoice: 'वॉइस नोट',
    thanks: 'धन्यवाद! दर्ज हो गया।', late: 'धन्यवाद। देर से दर्ज हुआ।',
    problem: 'समस्या बताएँ', hurt: 'चोट लगी', sick: 'बीमार है', bit: 'किसी को काटा', foodOut: 'खाना/पानी खत्म',
    alerted: 'मालिक और बैकअप को बता दिया गया है। इमरजेंसी कार्ड:',
    points: (pts, s, v) => `इस हफ़्ते: ${pts} पॉइंट · ${s} दिन लगातार · ${v} पक्की विज़िट। 500 पॉइंट = ₹20 कूपन।`,
    myPoints: 'मेरे पॉइंट', shareRecord: 'मेरा रिकॉर्ड भेजें', shareOff: 'रिकॉर्ड भेजना अभी चालू नहीं है।', stop: 'बंद करें', stopped: 'बंद हो गया। अब कुछ नहीं लिया जाएगा।',
  },
  mr: {
    chooseLang: 'तुमची भाषा निवडा',
    consent: (h, o, p) => `नमस्कार ${h}! ${o}ने तुम्हाला ${p}च्या काळजीची माहिती पाठवण्यासाठी Pawsure वर बोलावले आहे.\n• तुमच्या कामाची नोंद राहील.\n• फक्त वाटी किंवा प्राण्याचा फोटो, तुमचा चेहरा कधीच नाही.\n• तुम्ही कधीही थांबवू शकता.`,
    yes: 'हो', notNow: 'आत्ता नाही',
    declined: (o) => `हरकत नाही. काहीही नोंदवले जाणार नाही. ${o}ला कळवले आहे.`,
    method: 'तुम्ही कसे कळवाल?', photo: 'फोटो', voice: 'व्हॉइस नोट', missedCall: 'मिस्ड कॉल',
    methodSet: 'झाले. इथे उत्तर देऊन तुम्ही कधीही बदलू शकता.',
    prompt: (t, p, task) => `${t} · ${p}: ${task}`,
    promptPhotoHint: 'आजच्या कोडसह वाटीचा फोटो पाठवा.',
    sendPhotoCode: 'कोडसह फोटो', sendPhotoNoCode: 'कोडशिवाय फोटो', resendOld: 'जुना फोटो', sendVoice: 'व्हॉइस नोट',
    thanks: 'धन्यवाद! नोंद झाली.', late: 'धन्यवाद. उशिरा नोंद झाली.',
    problem: 'अडचण कळवा', hurt: 'दुखापत झाली', sick: 'आजारी आहे', bit: 'कुणाला चावला', foodOut: 'अन्न/पाणी संपले',
    alerted: 'मालक आणि बॅकअपला कळवले आहे. इमर्जन्सी कार्ड:',
    points: (pts, s, v) => `या आठवड्यात: ${pts} पॉइंट · सलग ${s} दिवस · ${v} खात्रीशीर भेटी. 500 पॉइंट = ₹20 कूपन.`,
    myPoints: 'माझे पॉइंट', shareRecord: 'माझी नोंद पाठवा', shareOff: 'नोंद पाठवणे अजून सुरू नाही.', stop: 'थांबवा', stopped: 'थांबवले. आता काहीही घेतले जाणार नाही.',
  },
};
