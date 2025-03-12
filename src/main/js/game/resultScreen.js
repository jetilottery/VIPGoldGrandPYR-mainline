define(function (require) {
    const gameFlow = require('skbJet/componentManchester/standardIW/gameFlow');
    const meterData = require('skbJet/componentManchester/standardIW/meterData');
    const audio = require('skbJet/componentManchester/standardIW/audio');
    const gameConfig = require('skbJet/componentManchester/standardIW/gameConfig');
    const SKBeInstant = require('skbJet/component/SKBeInstant/SKBeInstant');
    const displayList = require('skbJet/componentManchester/standardIW/displayList');
    const msgBus = require('skbJet/component/gameMsgBus/GameMsgBus');
    const PIXI = require('com/pixijs/pixi');
    const resLib = require('skbJet/component/resourceLoader/resourceLib');
    const playerNumbers = require('game/components/playerNumbers');

    require('com/gsap/TweenMax');
    const Tween = window.TweenMax;
    let glowAnimation;

    function init() {
        glowAnimation = new PIXI.spine.Spine(resLib.spine['WinAnnounce'].spineData);
        glowAnimation.renderable = false;
        glowAnimation.alpha = 0;
        displayList.winPlaqueGlow.addChild(glowAnimation);
        displayList.winPlaqueCloseButton.on('press', hideResult);

        displayList.winPlaqueValue1.parent.removeChild(displayList.winPlaqueValue1);
        displayList.winPlaqueValue.parent.addChild(displayList.winPlaqueValue1);
    }

    function hideResult() {
        Tween.to(glowAnimation, 0, {
            alpha: 0, onComplete: function () {
                glowAnimation.renderable = false;
            }
        });
    }

    function resultScreen() {
        // ResultPlaques template component handles populating and showing the result screen
        // All that needs doing here is playing the result screen audio


        playerNumbers.onResultPlaque();

        const terminator = meterData.totalWin > 0 ? 'winTerminator' : 'loseTerminator';
        if (gameConfig.backgroundMusicEnabled) {
            if (audio.isPlaying('music')) {
                audio.fadeOut('music', gameConfig.resultMusicFadeOutDuration);
            }
        }
        msgBus.publish('game.winningNumber.resetBagDropFlag');
        Tween.delayedCall(gameConfig.resultTerminatorFadeInDelay, () =>
            audio.fadeIn(terminator, gameConfig.resultTerminatorFadeInDuration, false)
        );

        displayList.winPlaqueValue.text = SKBeInstant.formatCurrency(meterData.totalWin).formattedAmount;
        displayList.winPlaqueValue1.text = SKBeInstant.formatCurrency(meterData.totalWin).formattedAmount;
    }

    msgBus.subscribe('UI.hideResult', hideResult);
    gameFlow.handle(resultScreen, 'RESULT_SCREEN');

    return {
        init
    };
});
