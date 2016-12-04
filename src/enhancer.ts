import { Window } from './window';
import { Provider } from './provider';
import { Highlighter } from './highlighter';
import { Checker } from './checker';
import { Speaker } from './speaker';

declare var window: Window;

export class Enhancer {
    constructor(
        private readonly provider: Provider, 
        private readonly highlighter: Highlighter, 
        private readonly checker: Checker, 
        private readonly speaker: Speaker
    ) {
        this.provider = provider;
        this.highlighter = highlighter;
        this.checker = checker;
        this.speaker = speaker;
    }

    public enhance(): void {
        var parentBinding = window.doBinding;
        window.doBinding = function () {
            parentBinding();

            this.resetTranslationStyle();
            this.enhanceTranslationCheck();
            this.enhanceSpeaker();
        };
        window.checkTranslation = this.enhanceTranslationCheck;
        this.enhanceSearch();
    }

    private enhanceSearch(): void {
        $('#word_search_input').keypress(function (e) {
            if (e.which == 13) {
                window.word_search();
            }
        });
    }

    private enhanceTranslationCheck(): void {
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
    }

    private enhanceSpeaker(): void {
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
    }

    private resetTranslationStyle(): void {
        this.provider.setTranslationAttr({ autocomplete: 'off' });
        this.highlighter.resetTranslationStyle();
    }
}