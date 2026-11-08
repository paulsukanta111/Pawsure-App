/** Cover-request WhatsApp drafts in each friend's language (PS-059, PS-118). Draft translations; review before the pilot. */
import type { Lang } from './store';

export function requestMessage(lang: Lang, friend: string, owner: string, pet: string, summary: string): string {
  switch (lang) {
    case 'hi':
      return `नमस्ते ${friend}! ${owner} पूछ रही हैं क्या आप ${pet} की मदद कर सकते हैं: ${summary}। हाँ, नहीं या कोई और समय लिखकर जवाब दें। पता और चाबी की जानकारी आपके हाँ कहने और ${owner} की पुष्टि के बाद ही मिलेगी।`;
    case 'mr':
      return `नमस्कार ${friend}! ${owner} विचारत आहेत तुम्ही ${pet}ला मदत करू शकाल का: ${summary}. हो, नाही किंवा दुसरी वेळ लिहून उत्तर द्या. पत्ता आणि चावीची माहिती तुम्ही हो म्हटल्यावर आणि ${owner}ने खात्री केल्यावरच मिळेल.`;
    default:
      return `Hi ${friend}! ${owner} is asking if you can help ${pet}: ${summary}. Reply Yes, No, or another time. Address and key details are shared only after you say yes and ${owner} confirms.`;
  }
}

export const LANG_NAME: Record<Lang, string> = { en: 'English', hi: 'Hindi', mr: 'Marathi' };

/** "Feed + walk for Bruno, …" -> "feed + walk for Bruno, …" (names keep their capitals). */
export const lowerFirst = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);
