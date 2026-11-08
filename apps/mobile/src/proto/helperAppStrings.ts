/**
 * Labels around the helper's chat and her Pawsure card (the web page her "My points" link opens).
 * Same rules as helperStrings: short, one action each. Draft translations; native review before pilot.
 */
import type { Lang } from './store';

export const HELPER_APP_TEXT: Record<Lang, {
  chats: string; business: string; noInvite: string; noInviteBody: string; card: string; cardSub: string; basicPhone: string; basicPhoneSub: string;
  message: string; camera: string; voiceBtn: string; noTask: string; cardTitle: string; visits: string; streak: string; points: string;
  onHold: string; onHoldBody: string; toCoupon: (n: number) => string; getCoupon: string; couponDone: string; history: string; homes: string; homesBody: string;
  rights: string; rightsBody: string; stop: string; stopConfirm: string; stopped: string; earned: string; held: string; redeemed: string; reversed: string;
  waiting: string; nextTask: string; noneNow: string;
}> = {
  en: {
    chats: 'Chats', business: 'Business account', noInvite: 'No messages from Pawsure yet', noInviteBody: 'Pawsure writes to Sunita only after Neha invites her.',
    card: 'My Pawsure card', cardSub: 'Opens in the browser. Nothing to install.', basicPhone: 'Basic phone', basicPhoneSub: 'Check in with a free missed call and a code',
    message: 'Message', camera: 'Send photo', voiceBtn: 'Send voice note', noTask: 'No task is waiting right now.',
    cardTitle: 'Pawsure card', visits: 'Verified visits', streak: 'Day streak', points: 'Points',
    onHold: 'On hold', onHoldBody: 'Held while a check-in is reviewed. Not a complaint. Decided within 7 days.',
    toCoupon: (n) => `${n} more points for a ₹20 coupon`, getCoupon: 'Get ₹20 coupon', couponDone: 'Coupon sent to you on WhatsApp.',
    history: 'Points history', homes: 'Homes', homesBody: 'Each home sees only its own visits. Points from all homes go to one card.',
    rights: 'Your data', rightsBody: 'Only bowl and pet photos, never your face. See, correct or delete your data any time.',
    stop: 'Stop Pawsure', stopConfirm: 'Stop for all homes?', stopped: 'Stopped. Nothing more is collected.',
    earned: 'earned', held: 'on hold', redeemed: 'coupon', reversed: 'not given', waiting: 'waiting for you', nextTask: 'Next', noneNow: 'Nothing due now',
  },
  hi: {
    chats: 'चैट', business: 'बिज़नेस अकाउंट', noInvite: 'Pawsure से अभी कोई संदेश नहीं', noInviteBody: 'नेहा के बुलाने के बाद ही Pawsure सुनीता को लिखता है।',
    card: 'मेरा Pawsure कार्ड', cardSub: 'ब्राउज़र में खुलता है। कुछ इंस्टॉल नहीं करना।', basicPhone: 'साधारण फ़ोन', basicPhoneSub: 'मुफ़्त मिस्ड कॉल और कोड से बताएँ',
    message: 'संदेश', camera: 'फ़ोटो भेजें', voiceBtn: 'वॉइस नोट भेजें', noTask: 'अभी कोई काम बाकी नहीं।',
    cardTitle: 'Pawsure कार्ड', visits: 'पक्की हाज़िरी', streak: 'लगातार दिन', points: 'पॉइंट',
    onHold: 'रुके हुए', onHoldBody: 'जाँच चलने तक रुके हैं। यह शिकायत नहीं है। 7 दिन में फ़ैसला।',
    toCoupon: (n) => `₹20 कूपन के लिए ${n} पॉइंट और`, getCoupon: '₹20 कूपन लें', couponDone: 'कूपन WhatsApp पर भेज दिया।',
    history: 'पॉइंट का हिसाब', homes: 'घर', homesBody: 'हर घर सिर्फ़ अपनी हाज़िरी देखता है। सभी घरों के पॉइंट एक कार्ड पर।',
    rights: 'आपका डेटा', rightsBody: 'सिर्फ़ कटोरी और पालतू की फ़ोटो, आपका चेहरा कभी नहीं। कभी भी देखें, सुधारें या मिटाएँ।',
    stop: 'Pawsure बंद करें', stopConfirm: 'सभी घरों के लिए बंद करें?', stopped: 'बंद। अब कुछ दर्ज नहीं होगा।',
    earned: 'मिले', held: 'रुके', redeemed: 'कूपन', reversed: 'नहीं मिले', waiting: 'आपका इंतज़ार', nextTask: 'अगला', noneNow: 'अभी कुछ बाकी नहीं',
  },
  mr: {
    chats: 'चॅट', business: 'बिझनेस अकाउंट', noInvite: 'Pawsure कडून अजून संदेश नाही', noInviteBody: 'नेहाने बोलावल्यावरच Pawsure सुनीताला लिहिते.',
    card: 'माझे Pawsure कार्ड', cardSub: 'ब्राउझरमध्ये उघडते. काही इन्स्टॉल नाही.', basicPhone: 'साधा फोन', basicPhoneSub: 'मोफत मिस्ड कॉल आणि कोडने कळवा',
    message: 'संदेश', camera: 'फोटो पाठवा', voiceBtn: 'व्हॉइस नोट पाठवा', noTask: 'आत्ता कोणतेही काम बाकी नाही.',
    cardTitle: 'Pawsure कार्ड', visits: 'पक्क्या भेटी', streak: 'सलग दिवस', points: 'पॉइंट',
    onHold: 'थांबवलेले', onHoldBody: 'तपासणी होईपर्यंत थांबवले. ही तक्रार नाही. 7 दिवसांत निर्णय.',
    toCoupon: (n) => `₹20 कूपनसाठी अजून ${n} पॉइंट`, getCoupon: '₹20 कूपन घ्या', couponDone: 'कूपन WhatsApp वर पाठवले.',
    history: 'पॉइंटचा हिशोब', homes: 'घरे', homesBody: 'प्रत्येक घर फक्त स्वतःच्या भेटी पाहते. सर्व घरांचे पॉइंट एका कार्डवर.',
    rights: 'तुमचा डेटा', rightsBody: 'फक्त वाटी आणि प्राण्याचे फोटो, तुमचा चेहरा कधीच नाही. कधीही पाहा, दुरुस्त करा किंवा हटवा.',
    stop: 'Pawsure थांबवा', stopConfirm: 'सर्व घरांसाठी थांबवायचे?', stopped: 'थांबवले. आता काही नोंदवले जाणार नाही.',
    earned: 'मिळाले', held: 'थांबवले', redeemed: 'कूपन', reversed: 'मिळाले नाहीत', waiting: 'तुमची वाट', nextTask: 'पुढचे', noneNow: 'आत्ता काही बाकी नाही',
  },
};
