define((require) => {
  const PIXI = require('com/pixijs/pixi');
  const resLib = require('skbJet/component/resourceLoader/resourceLib');
  const utils = require('game/components/utils/utils');
  const NumberCard = require('./NumberCard');
  const gameConfig = require('skbJet/componentManchester/standardIW/gameConfig');
  const Tween = window.TweenMax;
  const audio = require('skbJet/componentManchester/standardIW/audio');
  const msgBus = require('skbJet/component/gameMsgBus/GameMsgBus');

  require('com/gsap/TimelineMax');
  require('com/gsap/easing/EasePack');

  const TimelineMax = window.TimelineMax;

  const WIDTH = 96;
  const HEIGHT = 114;

  class WinningNumber extends NumberCard {
    constructor(index) {
      super(WIDTH, HEIGHT);
      this.firstPlay = true;
      this.bagIndex = index;
      this.pickPointType = 'Lucky';
      this.defaultState = 'LuckySTATIC';
      this.introTimeLine = null;
      this.initSpine();
      this.reset();
      this.dropBags();
      this.coverContainer.renderable = true;
      this.skipDrop = null;
      this.bagDrop = true;
      this.playingWinIdle = false;

      msgBus.subscribe('game.winningNumber.resetBagDropFlag', () => {
        this.bagDrop = false;
      });
    }

    enable() {
      return new Promise(resolve => {
        this.reveal = resolve;
        this.enabled = true;
        if (this.revealed) {
          resolve();
        }
        if (gameConfig.forcedLuckyNumberReveal === true) {
          this.inGame = true;
          this.introTimeLine.restart();
        }
      }).then(() => {
        this.enabled = false;
      });
    }

    dropBags() {
      let _this = this;

      this.introTimeLine = new TimelineMax({
        paused: true
      });

      let func1 = function() {
        _this.coverContainer.renderable = true;
        _this.enabled = false;
      };

      let func2 = function() {
        if (_this.firstPlay === false) {
          if (_this.bagDrop === false) {
            _this.bagDrop = true;
            _this.coverAnim.state.tracks[0].timeScale = 1;
            _this.coverAnim.state.setAnimation(0, 'LuckyRESET', false);
            _this.coverAnim.state.addAnimation(0, 'LuckyIDLE', true, 0);
            Tween.delayedCall(0.3, () => {
              audio.play('bagDrop');
            });
          }
        }
      };

      let func3 = function() {
        if (_this.inGame === true) {
          _this.firstPlay = false;
          _this.intro = null;
          _this.reveal();
        }
      };


      this.introTimeLine.add(func1, 0);
      this.introTimeLine.add(func2, gameConfig.forcedLuckyNumberRevealDropSpeed * this.bagIndex);
      this.introTimeLine.add(func3, "+=" + (gameConfig.forcedLuckyNumberRevealSpeed));
    }

    skip() {
      this.introTimeLine.restart();
      this.introTimeLine.pause();
      this.firstPlay = false;
      this.reveal();
    }

    initSpine() {
      const _this = this;
      this.coverAnim = new PIXI.spine.Spine(resLib.spine['CoverAnims'].spineData);
      this.setSpineCoverState({
        state: 'DEFAULT',
        loop: false
      });
      this.coverContainer.addChild(_this.coverAnim);

      this.coverAnim.stateData.setMix('LuckyIDLE', 'LuckyMOUSEOVER', 0.2);
      this.coverAnim.stateData.setMix('LuckyMOUSEOVER', 'LuckyIDLE', 0.2);
      this.coverAnim.stateData.setMix('LuckyMOUSEOVER', 'LuckyMOUSEOUT', 0.3);
      this.coverAnim.stateData.setMix('LuckyMOUSEOUT', 'LuckyMOUSEOVER', 0.3);
    }

    populate(number) {
      this.number = number;
      this.assetNumber = number < 10 ? '0' + number : '' + number;
      super.populate(this.number, 'Gold'); // Always pass through GOLD for te Lucky numbers
    }

    prompt() {
      if (gameConfig.forcedLuckyNumberReveal === false || gameConfig.forcedLuckyNumberReveal === undefined) {
        super.prompt();
      }
    }

    presentWin(delayPresentation) {
      let _this = this;
      let presentationDelay = delayPresentation ? 0.6 : 0;
      _this.bringToFront();
      if (!_this.playingWinIdle) {
        audio.playSequential('numberMatch', false);
      }
      Tween.delayedCall(presentationDelay, function() {
        return new Promise(resolve => Tween.fromTo(
          _this.resultContainer.scale,
          0.75, {
            x: 0.666,
            y: 0.666
          }, {
            x: 1,
            y: 1,
            ease: window.Elastic.easeOut.config(
              gameConfig.matchAnimAmplitude,
              gameConfig.matchAnimPeriod
            ),
            onStart: function() {
              Tween.delayedCall(0.28, function() {
                if (!_this.playingWinIdle) {
                  _this.resultAnim.state.setAnimation(0, 'GoldMATCHED_IDLE', true);
                  _this.playingWinIdle = true;
                }
              });
            },
            onComplete: function() {
              if (!_this.playingWinIdle) {
                _this.resultAnim.state.tracks[0].time = 0;
                _this.resultAnim.state.tracks[0].timeScale = 1;
              }
              resolve();
            },
          }
        ));
      });
    }

    setSpineCoverState(data) {
      let nextState;
      let doLoop = data.loop || false;
      let syncTime = data.sync || 0;

      switch (data.state) {
        case 'DEFAULT':
          nextState = 'LuckySTATIC';
          break;
        case 'IDLE':
          nextState = 'LuckyIDLE';
          break;
        case 'REVEAL':
          nextState = 'LuckyREVEAL';
          break;
        case 'ROLLOVER':
          nextState = 'LuckySTATIC';
          break;
        case 'ROLLOUT':
          nextState = 'LuckySTATIC';
          break;
        case 'OFF':
          nextState = this.defaultState;
          break;
        default:
          nextState = this.defaultState;
          break;
      }

      // If we're already in a rollout state, we don't want to be forcing the state back to default
      // as this would interrupt the rollout animation, so if we're going back to default, don't do anything
      if (this.interactionState === 'ROLLOUT' && nextState === this.defaultState) {
        return;
      }

      // Store the interaction state
      this.interactionState = data.state;

      this.coverAnim.renderable = data.state !== 'OFF';
      this.coverAnim.state.setAnimation(syncTime, nextState, doLoop);

      let globalScope = this;
      if (data.state === 'REVEAL') {
        Tween.delayedCall(0.2, function startResultAnimation() {
          globalScope.setSpineResultState();
        });
      }
    }

    rollover() {
      super.rollover();

      this.coverAnim.state.setAnimation(0, 'LuckyMOUSEOVER', false);

    }

    stopRollover() {
      super.stopRollover();

      if (this.enabled && this.interactionState === 'ROLLOUT') {
        this.coverAnim.state.setAnimation(0, 'LuckyMOUSEOUT', false);
      }
    }

    setSpineResultState() {
      let _this = this;
      this.resultAnim.skeleton.setSkin(null);
      this.resultAnim.skeleton.setSkinByName('GOLD/GF' + this.assetNumber);
      this.resultAnim.state.setAnimation(0, 'GoldREVEAL', false);
      this.resultAnim.state.addAnimation(0, 'GoldIDLE', true, 0);
      this.resultAnim.state.addListener({
        start: function(entry) {
          if (entry.animation.name.indexOf('GoldIDLE') > -1) {
            if (!_this.matched) {
              _this.resultAnim.state.tracks[0].timeScale = 0;
              _this.resultAnim.state.tracks[0].time = 2;
            } else {
              _this.resultAnim.state.tracks[0].timeScale = 1;
            }
            utils.removeSpineListeners(this.resultAnim);
          }
        }
      });
    }

    reset() {
      super.reset();
      this.playingWinIdle = false;
      if (gameConfig.forcedLuckyNumberReveal === true) {
        if (this.firstPlay === false) {
          if (this.bagDrop === false) {
            this.coverContainer.renderable = false;
            this.coverAnim.state.setAnimation(0, 'LuckyRESET', false);
            this.coverAnim.state.tracks[0].timeScale = 0;
          }
          this.introTimeLine.restart();
        }
      }
    }

    static fromContainer(container, index) {
      const card = new WinningNumber(index);
      container.addChild(card);
      return card;
    }
  }

  return WinningNumber;
});