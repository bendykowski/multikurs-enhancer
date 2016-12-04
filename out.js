define("provider", ["require", "exports"], function (require, exports) {
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
});
define("checker", ["require", "exports"], function (require, exports) {
    "use strict";
    var Checker = (function () {
        function Checker(provider) {
            this.correctTranslation = 'correct';
            this.typoTranslation = 'typo';
            this.incorrectTranslation = 'incorrect';
            this.provider = provider;
        }
        /**
         * @todo Add the ability to compare sentences with more than one version of a word:
         * ex. "thought/speech bubble" gives both "thought bubble" and "speech bubble"
         *
         * @returns {{evaluation: *, numberOfMistakes: *, synonymGuessed: boolean}}
         */
        Checker.prototype.checkTranslation = function () {
            var translation = this.provider.getTranslation();
            var foreignWords = this.provider.getForeignWords();
            var actualNumberOfMistakes = this.getLongestWordLength(foreignWords);
            var synonymGuessed = false;
            var i, numberOfMistakes, evaluation;
            for (i = 0; i < foreignWords.length; ++i) {
                numberOfMistakes = this.stringsDistance(translation, foreignWords[i]);
                if (numberOfMistakes < actualNumberOfMistakes) {
                    actualNumberOfMistakes = numberOfMistakes;
                    if (i > 0) {
                        synonymGuessed = foreignWords[i];
                    }
                }
            }
            evaluation = this.getEvaluation(actualNumberOfMistakes);
            return {
                evaluation: evaluation,
                numberOfMistakes: actualNumberOfMistakes,
                synonymGuessed: synonymGuessed
            };
        };
        // Compute the edit distance between the two given strings (Damerau–Levenshtein distance)
        Checker.prototype.stringsDistance = function (a, b) {
            if (a.length === 0)
                return b.length;
            if (b.length === 0)
                return a.length;
            var i, j, cost;
            var matrix = [];
            // increment along the first column of each row
            for (i = 0; i <= a.length; i++) {
                matrix[i] = [i];
            }
            // increment each column in the first row
            for (j = 0; j <= b.length; j++) {
                matrix[0][j] = j;
            }
            // Fill in the rest of the matrix
            for (i = 1; i <= a.length; i++) {
                for (j = 1; j <= b.length; j++) {
                    cost = a.charAt(i - 1) == b.charAt(j - 1) ? 0 : 1;
                    matrix[i][j] = Math.min(matrix[i - 1][j] + 1, // deletion
                    matrix[i][j - 1] + 1, // insertion
                    matrix[i - 1][j - 1] + cost // substitution
                    );
                    // Damerau transposition
                    if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
                        matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + cost // transposition
                        );
                    }
                }
            }
            return matrix[a.length][b.length];
        };
        Checker.prototype.getEvaluation = function (numberOfMistakes) {
            var evaluation;
            switch (numberOfMistakes) {
                case 0:
                    evaluation = this.correctTranslation;
                    break;
                case 1:
                case 2:
                    evaluation = this.typoTranslation;
                    break;
                default:
                    evaluation = this.incorrectTranslation;
                    break;
            }
            return evaluation;
        };
        Checker.prototype.getLongestWordLength = function (words) {
            return words.slice(0).sort(function (a, b) { return b.length - a.length; })[0].length;
        };
        return Checker;
    }());
    exports.Checker = Checker;
});
define("highlighter", ["require", "exports"], function (require, exports) {
    "use strict";
    var Highlighter = (function () {
        function Highlighter(provider, checker) {
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
});
define("speaker", ["require", "exports"], function (require, exports) {
    "use strict";
    var Speaker = (function () {
        function Speaker() {
        }
        Speaker.prototype.say = function (text) {
            var msg = new SpeechSynthesisUtterance();
            msg.text = this.prepareText(text);
            msg.voice = speechSynthesis.getVoices().filter(function (voice) { return voice.name == 'Daniel'; })[0];
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
});
define("enhancer", ["require", "exports"], function (require, exports) {
    "use strict";
    var Enhancer = (function () {
        function Enhancer(provider, highlighter, checker, speaker) {
            this.provider = provider;
            this.highlighter = highlighter;
            this.checker = checker;
            this.speaker = speaker;
        }
        Enhancer.prototype.enhance = function () {
            var parentBinding = window.doBinding;
            window.doBinding = function () {
                parentBinding();
                this.resetTranslationStyle();
                this.enhanceTranslationCheck();
                this.enhanceSpeaker();
            };
            window.checkTranslation = this.enhanceTranslationCheck;
            this.enhanceSearch();
        };
        Enhancer.prototype.enhanceSearch = function () {
            $('#word_search_input').keypress(function (e) {
                if (e.which == 13) {
                    window.word_search();
                }
            });
        };
        Enhancer.prototype.enhanceTranslationCheck = function () {
            var translationCheck;
            if (!this.provider.isAnswerScreen()) {
                return;
            }
            translationCheck = this.checker.checkTranslation();
            this.highlighter.highlightTranslation(translationCheck);
            if (translationCheck.synonymGuessed) {
                this.highlighter.highlightSynonym(translationCheck);
            }
            this.highlighter.highlightButton(translationCheck);
        };
        Enhancer.prototype.enhanceSpeaker = function () {
            if (this.provider.isAnswerScreen() && !this.provider.hasPlayButton()) {
                var previousElement = this.provider.get$transcription().length ? this.provider.get$transcription() : this.provider.get$foreignWord();
                previousElement.after($('<a/>', {
                    'class': 'PlayButton key_q key_semicolon',
                    style: 'display:inline-block;margin:0px 5px;position:relative;top:1px;',
                    title: 'Odtwórz nagranie',
                    on: {
                        click: function () {
                            this.speaker.say(this.provider.getForeignWord());
                        }
                    }
                }));
                this.speaker.say(this.provider.getForeignWord());
            }
        };
        Enhancer.prototype.resetTranslationStyle = function () {
            this.provider.setTranslationAttr({ autocomplete: 'off' });
            this.highlighter.resetTranslationStyle();
        };
        return Enhancer;
    }());
    exports.Enhancer = Enhancer;
});
// ==UserScript==
// @name         Multikurs Enhanced
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the Multikurs!
// @author       You
// @match        http://www.multikurs.pl/index.php?mod=Frontend*
// @grant        none
// ==/UserScript==
define("main", ["require", "exports", "enhancer", "provider", "highlighter", "checker", "speaker"], function (require, exports, enhancer_1, provider_1, highlighter_1, checker_1, speaker_1) {
    "use strict";
    var provider = new provider_1.Provider();
    var checker = new checker_1.Checker(provider);
    var highlighter = new highlighter_1.Highlighter(provider, checker);
    var speaker = new speaker_1.Speaker();
    var enhancer = new enhancer_1.Enhancer(provider, highlighter, checker, speaker);
    $(window).load(function () {
        enhancer.enhance();
    });
});
