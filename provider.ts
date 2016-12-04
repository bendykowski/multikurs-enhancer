export class Provider {
    public isAnswerScreen(): boolean {
        return Boolean(this.get$foreignWord().length);
    }

    public hasPlayButton(): boolean {
        return Boolean(this.get$playButton().length);
    }

    public getForeignWord(): string {
        return this.get$foreignWord().clone().children().remove().end().text().trim();
    }

    public getForeignWords(): string[] {
        return [this.getForeignWord()].concat(this.getSynonyms());
    }

    public getTranslation(): string {
        return this.get$translation().val();
    }

    public getSynonyms(): string[] {
        var synonymsContainer = this.get$synonyms().text();
        var synonyms = synonymsContainer.match(/ ([^,)]+)/g);
        return synonyms ? synonyms.map(function (s) { return s.trim(); }) : [];
    }

    public replaceInSynonyms(from: string, to: string): void {
        var synonyms = this.get$synonyms();
        synonyms.html(
            synonyms.html().replace(from, to)
        );
    }

    public setTranslationStyle(css: Object): void {
        this.get$translation().css(css);
    }

    public setTranslationAttr(attr: Object): void {
        this.get$translation().attr(attr);
    }

    public get$foreignWord(): JQuery {
        return $('.foreignWord>span:first');
    }

    public get$transcription(): JQuery {
        return $('.foreignWord .transcription');
    }

    private get$translation(): JQuery {
        return $('#translation');
    }

    private get$synonyms(): JQuery {
        return $('.CourseWordInfo span:contains("synonimy:")');
    }

    private get$playButton(): JQuery {
        return $('.foreignWord .PlayButton');
    }
}