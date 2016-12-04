"use strict";
var Provider = (function () {
    function Provider() {
    }
    Provider.prototype.isAnswerScreen = function () {
        return Boolean(this.get$foreignWord().length);
    };
    Provider.prototype.hasPlayButton = function () {
        return Boolean(this.get$playButton().length);
    };
    Provider.prototype.getForeignWord = function () {
        return this.get$foreignWord().clone().children().remove().end().text().trim();
    };
    Provider.prototype.getForeignWords = function () {
        return [this.getForeignWord()].concat(this.getSynonyms());
    };
    Provider.prototype.getTranslation = function () {
        return this.get$translation().val();
    };
    Provider.prototype.getSynonyms = function () {
        var synonymsContainer = this.get$synonyms().text();
        var synonyms = synonymsContainer.match(/ ([^,)]+)/g);
        return synonyms ? synonyms.map(function (s) { return s.trim(); }) : [];
    };
    Provider.prototype.replaceInSynonyms = function (from, to) {
        var synonyms = this.get$synonyms();
        synonyms.html(synonyms.html().replace(from, to));
    };
    Provider.prototype.setTranslationStyle = function (css) {
        this.get$translation().css(css);
    };
    Provider.prototype.setTranslationAttr = function (attr) {
        this.get$translation().attr(attr);
    };
    Provider.prototype.get$foreignWord = function () {
        return $('.foreignWord>span:first');
    };
    Provider.prototype.get$transcription = function () {
        return $('.foreignWord .transcription');
    };
    Provider.prototype.get$translation = function () {
        return $('#translation');
    };
    Provider.prototype.get$synonyms = function () {
        return $('.CourseWordInfo span:contains("synonimy:")');
    };
    Provider.prototype.get$playButton = function () {
        return $('.foreignWord .PlayButton');
    };
    return Provider;
}());
exports.Provider = Provider;
