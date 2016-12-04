import { Provider } from './provider';
import { Checker } from './checker';

export class Highlighter {
    private readonly styles = {
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

    public constructor(private provider: Provider, private checker: Checker) {
        this.provider = provider;
        this.checker = checker;
    }

    public resetTranslationStyle(): void {
        this.provider.setTranslationStyle(this.styles.default);
    }

    public highlightTranslation(translationCheck): void {
        this.provider.setTranslationStyle(this.styles[translationCheck.evaluation]);
    }

    public highlightSynonym(translationCheck): void {
        this.provider.replaceInSynonyms(
            translationCheck.synonymGuessed,
            '<b style="color:' + this.styles[translationCheck.evaluation]['border-color'] + ';">' + translationCheck.synonymGuessed + '</b>'
        );
    }

    public highlightButton(translationCheck): void {
        /** @TODO implement **/
    }
}