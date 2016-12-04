// ==UserScript==
// @name         Multikurs Enhanced
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the Multikurs!
// @author       You
// @match        http://www.multikurs.pl/index.php?mod=Frontend*
// @grant        none
// ==/UserScript==
"use strict";
var enhancer_1 = require('./enhancer');
var provider_1 = require('./provider');
var highlighter_1 = require('./highlighter');
var checker_1 = require('./checker');
var speaker_1 = require('./speaker');
var provider = new provider_1.Provider();
var checker = new checker_1.Checker(provider);
var highlighter = new highlighter_1.Highlighter(provider, checker);
var speaker = new speaker_1.Speaker();
var enhancer = new enhancer_1.Enhancer(provider, highlighter, checker, speaker);
$(window).load(function () {
    enhancer.enhance();
});
