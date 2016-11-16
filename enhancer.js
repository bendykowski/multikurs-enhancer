// ==UserScript==
// @name         Multikurs Enhanced
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the Multikurs!
// @author       You
// @match        http://www.multikurs.pl/index.php?mod=Frontend*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var provider = (function () {
        function isAnswerScreen() {
            return Boolean(get$foreignWord().length);
        }

        function getForeignWord() {
            return get$foreignWord().clone().children().remove().end().text().trim();
        }

        function getForeignWords() {
            return [getForeignWord()].concat(getSynonyms());
        }

        function getTranslation() {
            return get$translation().val();
        }

        function getSynonyms() {
            var synonymsContainer = get$synonyms().text();
            var synonyms = synonymsContainer.match(/ ([^,)]+)/g);
            return synonyms ? synonyms.map(function(s) { return s.trim(); }) : [];
        }

        function replaceInSynonyms(from, to) {
            var synonyms = get$synonyms();
            synonyms.html(
                synonyms.html().replace(from, to)
            );
        }

        function setTranslationStyle(css) {
            get$translation().css(css);
        }

        function setTranslationAttr(attr) {
            get$translation().attr(attr);
        }

        function get$translation() {
            return $('#translation');
        }

        function get$foreignWord() {
            return $('.foreignWord>span:first');
        }

        function get$synonyms() {
            return $('.CourseWordInfo span:contains("synonimy:")');
        }

        return {
            isAnswerScreen: isAnswerScreen,
            getTranslation: getTranslation,
            getForeignWord: getForeignWord,
            getForeignWords: getForeignWords,
            getSynonyms: getSynonyms,
            replaceInSynonyms: replaceInSynonyms,
            setTranslationStyle: setTranslationStyle,
            setTranslationAttr: setTranslationAttr
        };
    })();

    var checker = (function (provider) {
        var CORRECT_TRANSLATION = 'CORRECT';
        var TYPO_TRANSLATION = 'TYPO';
        var INCORRECT_TRANSLATION = 'INCORRECT';

        // Compute the edit distance between the two given strings (Damerau–Levenshtein distance)
        function stringsDistance(a, b) {
            if (a.length === 0) return b.length;
            if (b.length === 0) return a.length;

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
                    cost = a.charAt(i-1) == b.charAt(j-1) ? 0 : 1;

                    matrix[i][j] = Math.min(
                        matrix[i-1][j] + 1, // deletion
                        matrix[i][j-1] + 1, // insertion
                        matrix[i-1][j-1] + cost // substitution
                    );

                    // Damerau transposition
                    if (i > 1 && j > 1 && a[i-1] === b[j-2] && a[i-2] === b[j-1]) {
                        matrix[i][j] = Math.min(
                            matrix[i][j],
                            matrix[i-2][j-2] + cost // transposition
                        );
                    }
                }
            }

            return matrix[a.length][b.length];
        }

        function checkTranslation() {
            var translation = provider.getTranslation();
            var foreignWords = provider.getForeignWords();
            var actualNumberOfMistakes = getLongestWordLength(foreignWords);
            var synonymGuessed = false;
            var i, numberOfMistakes, evaluation;

            for (i = 0; i < foreignWords.length; ++ i) {
                numberOfMistakes = stringsDistance(translation, foreignWords[i]);
                if (numberOfMistakes < actualNumberOfMistakes) {
                    actualNumberOfMistakes = numberOfMistakes;
                    if (i > 0) {
                        synonymGuessed = foreignWords[i];
                    }
                }
            }

            evaluation = getEvaluation(actualNumberOfMistakes);

            return {
                evaluation: evaluation,
                numberOfMistakes: actualNumberOfMistakes,
                synonymGuessed: synonymGuessed
            };
        }

        function getEvaluation(numberOfMistakes) {
            var evaluation;
            switch (numberOfMistakes) {
                case 0:
                    evaluation = CORRECT_TRANSLATION;
                    break;
                case 1:
                case 2:
                case 3:
                    evaluation = TYPO_TRANSLATION;
                    break;
                default:
                    evaluation = INCORRECT_TRANSLATION;
                    break;
            }
            return evaluation;
        }

        function getLongestWordLength(words) {
            return words.slice(0).sort(function (a, b) { return b.length - a.length; })[0].length;
        }

        return {
            CORRECT_TRANSLATION: CORRECT_TRANSLATION,
            TYPO_TRANSLATION: TYPO_TRANSLATION,
            INCORRECT_TRANSLATION: INCORRECT_TRANSLATION,
            checkTranslation: checkTranslation
        };
    })(provider);

    var highlighter = (function (provider, checker) {
        var STYLES = {
            DEFAULT: {
                'background-color': 'rgb(255, 255, 255)',
                'border-color': 'rgb(217, 217, 217)'
            },
            CORRECT: {
                'background-color': 'rgb(205, 236, 190)',
                'border-color': 'rgb(66, 166, 16)'
            },
            TYPO: {
                'background-color': 'rgb(255, 250, 200)',
                'border-color': 'rgb(255, 200, 0)'
            },
            INCORRECT: {
                'background-color': 'rgb(255, 200, 200)',
                'border-color': 'rgb(255, 0, 0)'
            }
        };

        function resetTranslationStyle() {
            provider.setTranslationStyle(STYLES.DEFAULT);
        }

        function highlightTranslation(translationCheck) {
            provider.setTranslationStyle(STYLES[translationCheck.evaluation]);
        }

        function highlightSynonym(translationCheck) {
            provider.replaceInSynonyms(
                translationCheck.synonymGuessed,
                '<b style="color:' + STYLES[translationCheck.evaluation]['border-color'] + ';">' + translationCheck.synonymGuessed + '</b>'
            );
        }

        function highlightButton(translationCheck) {
            /** @TODO implement **/
        }

        return {
            highlightTranslation: highlightTranslation,
            highlightSynonym: highlightSynonym,
            highlightButton: highlightButton,
            resetTranslationStyle: resetTranslationStyle
        };
    })(provider, checker);

    var multikursEnhancer = (function (provider, highlighter, checker) {
        function enhanceTranslationCheck() {
            var translationCheck;

            if (!provider.isAnswerScreen()) {
                return;
            }

            translationCheck = checker.checkTranslation();
            highlighter.highlightTranslation(translationCheck);
            if (translationCheck.synonymGuessed) {
                highlighter.highlightSynonym(translationCheck);
            }
            highlighter.highlightButton(translationCheck);
        }

        function enhance() {
            var parentBinding = window.doBinding;
            window.doBinding = function() {
                parentBinding();

                resetTranslationStyle();
                enhanceTranslationCheck();
            };
            window.checkTranslation = enhanceTranslationCheck;
        }

        function resetTranslationStyle() {
            provider.setTranslationAttr({autocomplete: 'off'});
            highlighter.resetTranslationStyle();
        }

        return {
            enhance: enhance
        };
    })(provider, highlighter, checker);

    $(window).load(function() {
        multikursEnhancer.enhance();
    });
})();