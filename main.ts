// ==UserScript==
// @name         Multikurs Enhanced
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the Multikurs!
// @author       You
// @match        http://www.multikurs.pl/index.php?mod=Frontend*
// @grant        none
// ==/UserScript==

import { Enhancer } from './enhancer';
import { Provider } from './provider';
import { Highlighter } from './highlighter';
import { Checker } from './checker';
import { Speaker } from './speaker';

var provider: Provider = new Provider();
var checker: Checker = new Checker(provider);
var highlighter: Highlighter = new Highlighter(provider, checker);
var speaker: Speaker = new Speaker();
var enhancer: Enhancer = new Enhancer(provider, highlighter, checker, speaker);

$(window).load(function() {
    enhancer.enhance();
});