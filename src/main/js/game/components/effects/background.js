
define(require => {
    const msgBus = require('skbJet/component/gameMsgBus/GameMsgBus');
    const displayList = require('skbJet/componentManchester/standardIW/displayList');
    // const SKBeInstant = require('skbJet/component/SKBeInstant/SKBeInstant');
    // const meterData = require('skbJet/componentManchester/standardIW/meterData');
    const resLib = require('skbJet/component/resourceLoader/resourceLib');
    const orientation = require('skbJet/componentManchester/standardIW/orientation');
    // const gameConfig = require('skbJet/componentManchester/standardIW/gameConfig');
    const PIXI = require('com/pixijs/pixi');
    require('com/gsap/TweenMax');
    require('com/pixijs/pixi-particles');

    const Tween = window.TweenMax;
    const bonusElementsAnim = ['BGambient_BONUS','PORTRAIT/PORT_BGambient_BONUS'];
    const baseGameElementsAnim = ['BGambient','PORTRAIT/PORT_BGambient'];

    // const bgShapes = ['BGSHAPES','PORT_BGSHAPES'];
    // const bgShapesBonus = ['BGSHAPES_BONUS','PORT_BGSHAPES'];

    let basegameBackgroundLayer;
    let bonusBackgroundLayer;

    let elementsLayer;
    let shapesLayer;

    let spineAnim_Base;
    let spineAnim_Elements;
    let spineAnim_Shapes;
    let spineAnim_Shapes_Bonus;
    let spineAnim_Bonus;
    let spineAnim_BonusPort;

    // let pricePointIndex;
    // let backgroundColours;
    // let shapes;
    // let spineColourAnim;
    // let spineShapeSkin;
    // let currentShape;
    // let backgroundConfigCount;
    // let shapeConfigCount;

    let _toBonus;

    // Map config settings to spine animation names
    // const colourTable = {
    //     'Red': 'RED',
    //     'Grey': 'GREY',
    //     'Pink': 'PINK',
    //     'Purple': 'PURPLE',
    //     'Blue': 'BLUE',
    //     'Turquoise': 'TURQUOISE',
    //     'Green': 'GREEN',
    //     'Brown': 'BROWN',
    //     'lightRed': 'RED2',
    //     'lightPink': 'PINK2',
    //     'lightPurple': 'PURPLE2',
    //     'lightBlue': 'BLUE2',
    //     'lightTurquoise': 'TURQUOISE2',
    //     'lightGreen': 'GREEN2',
    //     'lightBrown': 'BROWN2'
    // };

    // Map config settings to spine skin names
    // const shapesTable = {
    //     'Triangle': 'TRIANGLE',
    //     'Star': 'STAR',
    //     'Circle': 'ELLIPSE',
    //     'Square': 'RECTANGLE',
    //     'Hexagon': 'HEXA',
    //     'Diamond': 'DIAMOND',
    //     'Heart': 'HEART',
    //     'Snowflake': 'SNOW',
    //     'Shamrock': 'SHAMROCK',
    //     'Flower': 'SPLAT'
    // };


    function init() {

        // backgroundColours = gameConfig.backgroundTints;
        // shapes = gameConfig.backgroundShapes;

        // backgroundConfigCount = Object.keys(backgroundColours).length;
        // shapeConfigCount = Object.keys(shapes).length;

        basegameBackgroundLayer = displayList.basegameBackground;
        bonusBackgroundLayer = displayList.bonusBackground;
        elementsLayer = displayList.backgroundElements;
        shapesLayer = displayList.backgroundShapes;

        // Set up spine project
        spineAnim_Base = new PIXI.spine.Spine(resLib.spine['BG'].spineData);
        spineAnim_Elements = new PIXI.spine.Spine(resLib.spine['BG_elements'].spineData);
        spineAnim_Shapes = new PIXI.spine.Spine(resLib.spine['BGshapes'].spineData);
        spineAnim_Shapes_Bonus = new PIXI.spine.Spine(resLib.spine['BGshapes'].spineData);
        spineAnim_Bonus = new PIXI.spine.Spine(resLib.spine['BonusBG'].spineData);
        spineAnim_BonusPort = new PIXI.spine.Spine(resLib.spine['BonusBG'].spineData);

        spineAnim_Bonus.renderable = false;
        spineAnim_BonusPort.renderable = false;

        // Add to background containers
        basegameBackgroundLayer.addChild(spineAnim_Base);
        bonusBackgroundLayer.addChild(spineAnim_Bonus, spineAnim_BonusPort);
        elementsLayer.addChild(spineAnim_Elements);
        shapesLayer.addChild(spineAnim_Shapes, spineAnim_Shapes_Bonus);

        spineAnim_Base.state.setAnimation(0, 'BLUE', false);
        spineAnim_Bonus.state.setAnimation(0, 'BLUE', false);
        // spineAnim_BonusPort.state.setAnimation(0, 'PORTRAIT/PORT_BLUE', false);
        spineAnim_Elements.state.setAnimation(0, baseGameElementsAnim[orientation.get() === orientation.LANDSCAPE ? 0 : 1], true);

        onOrientationchange();

        spineAnim_Bonus.alpha = 0;
        spineAnim_BonusPort.alpha = 0;

        spineAnim_Shapes.state.timeScale = 0.08;
        spineAnim_Shapes_Bonus.state.timeScale = 0.08;
        spineAnim_Shapes_Bonus.renderable = false;
        msgBus.subscribe('GameSize.OrientationChange', onOrientationchange);
        msgBus.subscribe('PrizeData.PrizeStructure', switchBackground);
        // msgBus.subscribe('game.background.update',updateBonusBackround);


        // PIXI.Text.prototype._generateFillStyle = gradientOverwrite;

    }

    // function gradientOverwrite(style, lines, metrics) {
    //
    //         const fillStyle = style.fill;
    //
    //         if (!Array.isArray(fillStyle)) {
    //             return fillStyle;
    //         }
    //         else if (fillStyle.length === 1) {
    //             return fillStyle[0];
    //         }
    //
    //         // the gradient will be evenly spaced out according to how large the array is.
    //         // ['#FF0000', '#00FF00', '#0000FF'] would created stops at 0.25, 0.5 and 0.75
    //         let gradient;
    //
    //         // a dropshadow will enlarge the canvas and result in the gradient being
    //         // generated with the incorrect dimensions
    //         const dropShadowCorrection = (style.dropShadow) ? style.dropShadowDistance : 0;
    //
    //         // should also take padding into account, padding can offset the gradient
    //         const padding = style.padding || 0;
    //
    //         const width = Math.ceil(this.canvas.width / this.resolution) - dropShadowCorrection - (padding * 2);
    //         const height = Math.ceil(this.canvas.height / this.resolution) - dropShadowCorrection - (padding * 2);
    //
    //         // make a copy of the style settings, so we can manipulate them later
    //         const fill = fillStyle.slice();
    //         const fillGradientStops = style.fillGradientStops.slice();
    //
    //         // wanting to evenly distribute the fills. So an array of 4 colours should give fills of 0.25, 0.5 and 0.75
    //         if (!fillGradientStops.length)
    //         {
    //             const lengthPlus1 = fill.length + 1;
    //
    //             for (let i = 1; i < lengthPlus1; ++i)
    //             {
    //                 fillGradientStops.push(i / lengthPlus1);
    //             }
    //         }
    //
    //         // stop the bleeding of the last gradient on the line above to the top gradient of the this line
    //         // by hard defining the first gradient colour at point 0, and last gradient colour at point 1
    //         fill.unshift(fillStyle[0]);
    //         fillGradientStops.unshift(0);
    //
    //         fill.push(fillStyle[fillStyle.length - 1]);
    //         fillGradientStops.push(1);
    //
    //         if (style.fillGradientType === 0)
    //         {
    //             // start the gradient at the top center of the canvas, and end at the bottom middle of the canvas
    //             gradient = this.context.createLinearGradient(width / 2, padding, width / 2, height + padding);
    //
    //             // we need to repeat the gradient so that each individual line of text has the same vertical gradient effect
    //             // ['#FF0000', '#00FF00', '#0000FF'] over 2 lines would create stops at 0.125, 0.25, 0.375, 0.625, 0.75, 0.875
    //
    //             // There's potential for floating point precision issues at the seams between gradient repeats.
    //             // The loop below generates the stops in order, so track the last generated one to prevent
    //             // floating point precision from making us go the teeniest bit backwards, resulting in
    //             // the first and last colors getting swapped.
    //             let lastIterationStop = 0;
    //
    //             // Actual height of the text itself, not counting spacing for lineHeight/leading/dropShadow etc
    //             const textHeight = style.fontSize + style.strokeThickness;
    //
    //             // textHeight, but as a 0-1 size in global gradient stop space
    //
    //
    //             for (let i = 0; i < lines.length; i++)
    //             {
    //                 let gradStopLineHeight = (textHeight / (i+1)) / height;
    //
    //                 const thisLineTop = style.lineHeight;
    //
    //                 lastIterationStop = 0;
    //
    //                 for (let j = 0; j < fill.length; j++)
    //                 {
    //                     // 0-1 stop point for the current line, multiplied to global space afterwards
    //                     let lineStop = 0;
    //
    //                     if (typeof fillGradientStops[j] === 'number')
    //                     {
    //                         lineStop = fillGradientStops[j];
    //                     }
    //                     else
    //                     {
    //                         lineStop = j / fill.length;
    //                     }
    //
    //                     const globalStop = (thisLineTop / height) + (lineStop * gradStopLineHeight);
    //
    //                     // Prevent color stop generation going backwards from floating point imprecision
    //                     let clampedStop = Math.max(lastIterationStop, globalStop);
    //
    //                     clampedStop = Math.min(clampedStop, 1); // Cap at 1 as well for safety's sake to avoid a possible throw.
    //                     gradient.addColorStop(clampedStop, fill[j]);
    //                     lastIterationStop = clampedStop;
    //                 }
    //             }
    //         }
    //         else
    //         {
    //             // start the gradient at the center left of the canvas, and end at the center right of the canvas
    //             gradient = this.context.createLinearGradient(padding, height / 2, width + padding, height / 2);
    //
    //             // can just evenly space out the gradients in this case, as multiple lines makes no difference
    //             // to an even left to right gradient
    //             const totalIterations = fill.length + 1;
    //             let currentIteration = 1;
    //
    //             for (let i = 0; i < fill.length; i++)
    //             {
    //                 let stop;
    //
    //                 if (typeof fillGradientStops[i] === 'number')
    //                 {
    //                     stop = fillGradientStops[i];
    //                 }
    //                 else
    //                 {
    //                     stop = currentIteration / totalIterations;
    //                 }
    //                 gradient.addColorStop(stop, fill[i]);
    //                 currentIteration++;
    //             }
    //         }
    //
    //         return gradient;
    //     }



    function onOrientationchange() {
        spineAnim_Base.x = spineAnim_Bonus.x = spineAnim_Elements.x = spineAnim_Shapes.x = spineAnim_Shapes_Bonus.x = orientation.get() === 'landscape' ? 720 : 405;
        spineAnim_Base.y = spineAnim_Bonus.y = spineAnim_Elements.y = spineAnim_Shapes.y = spineAnim_Shapes_Bonus.y = orientation.get() === 'landscape' ? 405 : 720;

        spineAnim_BonusPort.x = spineAnim_Base.x;
        spineAnim_BonusPort.y = spineAnim_Base.y;

        if(orientation.get() === orientation.LANDSCAPE) {
            spineAnim_Base.state.setAnimation(0, 'BLUE', true);
        } else {
            spineAnim_Base.state.setAnimation(0, 'PORTRAIT/PORT_BLUE', true);
        }

        // switchBackground();

        // spineAnim_Elements.state.setAnimation(0, baseGameElementsAnim[orientation.get() === orientation.LANDSCAPE?0:1], true);
        // spineAnim_Shapes.state.setAnimation(0, bgShapes[orientation.get() === orientation.LANDSCAPE?0:1], true);
        // spineAnim_Shapes_Bonus.state.setAnimation(0, bgShapesBonus[orientation.get() === orientation.LANDSCAPE?0:1], true);

        updateBonusBackround();
    }


    function switchBackground() {
        if (spineAnim_Base) {

        //     let prices = SKBeInstant.config.gameConfigurationDetails.availablePrices;
        //     pricePointIndex = prices.indexOf(meterData.ticketCost);

        //     // Change the background
        //     // Modulo - if there are less colours defined in the config than there are price points loop through the defined colours
        //     spineColourAnim = colourTable[backgroundColours[pricePointIndex % backgroundConfigCount]];
        //     msgBus.publish('Game.SetColourScheme', {'colour': spineColourAnim});

        //     // if (spineColourAnim !== currentBackground) {
        //         if (orientation.get() === orientation.LANDSCAPE) {
        //             spineAnim_Base.state.setAnimation(0, spineColourAnim, false);
        //             spineAnim_Bonus.state.setAnimation(0, spineColourAnim, false);
        //         } else {
        //             spineAnim_BonusPort.state.setAnimation(0, 'PORTRAIT/PORT_' + spineColourAnim, false);
        //         }
        //         // currentBackground = spineColourAnim;
        //     // }
        //     spineAnim_Elements.state.setAnimation(0, baseGameElementsAnim[orientation.get() === orientation.LANDSCAPE?0:1], true);
        //     // Change the shapes
        //     // Modulo - if there are less shapes defined in the config than there are price points loop through the defined shapes
        //     spineShapeSkin = shapesTable[shapes[pricePointIndex % shapeConfigCount]];
        //     if (spineShapeSkin !== currentShape) {
        //         spineAnim_Shapes.skeleton.setSkin(null);
        //         spineAnim_Shapes.skeleton.setSkinByName(spineShapeSkin);
        //         spineAnim_Shapes_Bonus.skeleton.setSkin(null);
        //         spineAnim_Shapes_Bonus.skeleton.setSkinByName(spineShapeSkin);
        //     }
        }
    }


    function transitionBackground(data) {

        return new Promise(resolve => {

            _toBonus = data.toBonus;

            if (_toBonus) {



                // TODO

                // put wheelbonus background into wheel bonus container

                // put collect bonus bg in coleectBonusContainer

                // make bonus background visible

                // fadeout basegame

                // if going to basegame

                // make basegame visible

                // fade out bonus bg container


                // set the bonus background to be visible
                if (orientation.get() === orientation.LANDSCAPE) {
                    spineAnim_Bonus.renderable = true;
                } else {
                    spineAnim_BonusPort.renderable = true;
                }


                spineAnim_BonusPort.alpha = 1;
                spineAnim_Bonus.alpha = 1;

                // fade out the current bg elements
                Tween.to([spineAnim_Base, spineAnim_Elements, spineAnim_Shapes], data.delay, {
                    alpha: 0, onComplete: function () {
                        // once faded out replace with the current bonus elements and get bonus shapes ready to appear
                        spineAnim_Shapes_Bonus.alpha = 0;
                        spineAnim_Shapes_Bonus.renderable = true;
                        spineAnim_Shapes.renderable = false;
                        spineAnim_Base.renderable = false;
                    }
                });

                updateBonusBackround();
                // once the elements has faded out and switched, fade it back in, showing the new one
                Tween.to([spineAnim_Elements, spineAnim_Shapes_Bonus] , data.delay, {
                    alpha: 1, delay: data.delay, onComplete: function () {
                        resolve();
                    }
                });

            } else {

                // swap the index of the basegame background to be behind the bonus background
                let targetIndex = displayList.background.getChildIndex(bonusBackgroundLayer);
                displayList.background.setChildIndex(basegameBackgroundLayer, targetIndex);

                // make basegame bg visible and alpha 1
                spineAnim_Base.renderable = true;
                spineAnim_Base.alpha = 1;
                basegameBackgroundLayer.visible = true;
                basegameBackgroundLayer.alpha = 1;

                // fade the bonus background and BG elements out
                Tween.to([spineAnim_Bonus, spineAnim_BonusPort, spineAnim_Elements, spineAnim_Shapes_Bonus], data.delay, {
                    alpha: 0, onComplete: function () {
                        // once faded out replace with the basegame elements
                        spineAnim_Shapes.alpha = 0;
                        spineAnim_Shapes.renderable = true;
                        spineAnim_Shapes_Bonus.renderable = false;
                        spineAnim_Elements.state.setAnimation(0, baseGameElementsAnim[orientation.get() === orientation.LANDSCAPE?0:1], true);
                    }
                });

                Tween.to([spineAnim_Elements,spineAnim_Shapes], data.delay, {
                    alpha: 1, delay: data.delay, onComplete: function () {
                        resolve();
                    }
                });

            }
        });
    }

    function updateBonusBackround() {
        if (orientation.get() === orientation.LANDSCAPE) {
            spineAnim_Bonus.renderable = true;
            spineAnim_BonusPort.renderable = false;
        } else {
            spineAnim_BonusPort.renderable = true;
            spineAnim_Bonus.renderable = false;
        }
        if(_toBonus) {
            spineAnim_Elements.state.setAnimation(0, bonusElementsAnim[orientation.get() === orientation.LANDSCAPE?0:1], true);
        }
    }

    return {
        init,
        transitionBackground,
    };
});