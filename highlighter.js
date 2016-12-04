"use strict";
var Highlighter = (function () {
    function Highlighter(provider, checker) {
        this.provider = provider;
        this.checker = checker;
        this.styles = {
            default: {
                'background-color': 'rgb(255, 255, 255)',
                'border-color': 'rgb(217, 217, 217)'
            },
            correct: {
                'background-color': 'rgb(205, 236, 190)',
                'border-color': 'rgb(66, 166, 16)'
            },
            typo: {
                'background-color': 'rgb(255, 250, 200)',
                'border-color': 'rgb(255, 200, 0)'
            },
            incorrect: {
                'background-color': 'rgb(255, 200, 200)',
                'border-color': 'rgb(255, 0, 0)'
            }
        };
        this.provider = provider;
        this.checker = checker;
    }
    Highlighter.prototype.resetTranslationStyle = function () {
        this.provider.setTranslationStyle(this.styles.default);
    };
    Highlighter.prototype.highlightTranslation = function (translationCheck) {
        this.provider.setTranslationStyle(this.styles[translationCheck.evaluation]);
    };
    Highlighter.prototype.highlightSynonym = function (translationCheck) {
        this.provider.replaceInSynonyms(translationCheck.synonymGuessed, '<b style="color:' + this.styles[translationCheck.evaluation]['border-color'] + ';">' + translationCheck.synonymGuessed + '</b>');
    };
    Highlighter.prototype.highlightButton = function (translationCheck) {
        /** @TODO implement **/
    };
    return Highlighter;
}());
exports.Highlighter = Highlighter;
