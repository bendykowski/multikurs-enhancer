"use strict";
var Speaker = (function () {
    function Speaker() {
    }
    Speaker.prototype.say = function (text) {
        var msg = new SpeechSynthesisUtterance();
        msg.text = this.prepareText(text);
        msg.voice = speechSynthesis.getVoices().filter(function (voice) {
            return voice.name == 'Daniel';
        })[0];
        speechSynthesis.speak(msg);
    };
    Speaker.prototype.prepareText = function (text) {
        text = text
            .replace(/(\W)sb(\W|$)/, '$1somebody$2')
            .replace(/(\W)sth(\W|$)/, '$1something$2');
        return text;
    };
    return Speaker;
}());
exports.Speaker = Speaker;
