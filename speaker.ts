export class Speaker {
    public say(text: string): void {
        var msg = new SpeechSynthesisUtterance();
        msg.text = this.prepareText(text);
        msg.voice = speechSynthesis.getVoices().filter(function (voice) { 
            return voice.name == 'Daniel'; 
        })[0];
        speechSynthesis.speak(msg);
    }

    private prepareText(text: string): string {
        text = text
            .replace(/(\W)sb(\W|$)/, '$1somebody$2')
            .replace(/(\W)sth(\W|$)/, '$1something$2');
        return text;
    }
}