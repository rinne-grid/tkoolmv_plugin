//=============================================================================
// Rngd_ChangeTitleMedia.js
// Copyright (c) 2017 rinne_grid
// This plugin is released under the MIT license.
// http://opensource.org/licenses/mit-license.php
//
// ・MITライセンスの元で公開されています。
// ・非商用/商用ゲーム問わずにご利用いただけます。
// ・年齢制限のあるコンテンツでのご利用も可能です。
// ・利用報告は必要ありません。
//
// Version
// 1.0.0 2017/11/23 公開
//
//=============================================================================
"use strict";
/*:ja
 * @plugindesc スイッチの状態によってタイトルピクチャやBGMを切り替えるプラグインです。
 * @author rinne_grid
 *
 * @param TARGET_SWTICH_ID
 * @type switch
 * @desc  タイトルピクチャを切り替えるスイッチです。このスイッチがONになっている場合にタイトル画像を変更します
 * @default
 *
 * @param TARGET_PICTURE_1
 * @desc 切り替え後のタイトルピクチャ名(背景)を指定します。変更しない場合:何も指定しない 非表示の場合:OFFを指定
 * @default Hexagram
 *
 * @param TARGET_PICTURE_2
 * @desc 切り替え後のタイトルピクチャ名(枠)を指定します。変更しない場合:何も指定しない 非表示の場合:OFFを指定
 * @default Floral
 *
 * @param TARGET_BGM_NAME
 * @desc 切り替え後のBGMを指定します。変更しない場合:何も指定しない 非表示の場合:OFFを指定
 * @default
 *
 * @help
 * このプラグインにはプラグインコマンドはありません。
 */


(function() {
    var rngdPluginIdChangeTitleImage = "Rngd_ChangeTitleMedia";
    var parameters = PluginManager.parameters(rngdPluginIdChangeTitleImage);

    //-------------------------------------------------------------------------
    // Scene_Titleの背景作成処理をカスタマイズする
    //-------------------------------------------------------------------------
    Scene_Title.prototype.createBackground = function() {
        var title1Name = "";
        var title2Name = "";

        // 対象のスイッチがONになっていた場合はタイトル画像を切り替える
        if(DataManager.isTargetSwitchTrue()) {
            // ブランクの場合、データベースのタイトル画像設定を利用する
            title1Name = parameters["TARGET_PICTURE_1"] || $dataSystem.title1Name;
            title2Name = parameters["TARGET_PICTURE_2"] || $dataSystem.title2Name;

            if(title1Name.toLowerCase() === "off") {
                title1Name = "";
            }

            if(title2Name.toLowerCase() === "off") {
                title2Name = "";
            }

        }
        this._backSprite1 = new Sprite(ImageManager.loadTitle1(title1Name));
        this._backSprite2 = new Sprite(ImageManager.loadTitle2(title2Name));
        this.addChild(this._backSprite1);
        this.addChild(this._backSprite2);
    };

    Scene_Title.prototype.playTitleMusic = function() {

        var titleBgmName = parameters["TARGET_BGM_NAME"];
        var titleBgmObj = {}
        Object.assign(titleBgmObj, $dataSystem.titleBgm);

        if(titleBgmName.toLowerCase() === "off") {
            AudioManager.stopBgm();
            AudioManager.stopBgs();
            AudioManager.stopMe();
            return;
        }
        titleBgmObj.name = titleBgmName;
        // 対象のスイッチがON
        if(DataManager.isTargetSwitchTrue()) {
            // BGMを変更しない場合
            if(titleBgmName === "" || titleBgmName === null) {
                Object.assign(titleBgmObj, $dataSystem.titleBgm);
            }
        // 対象のスイッチがOFF
        } else {
            // 通常のBGMを再生
            Object.assign(titleBgmObj, $dataSystem.titleBgm);
        }
        AudioManager.playBgm(titleBgmObj);
        AudioManager.stopBgs();
        AudioManager.stopMe();
    };

    //-------------------------------------------------------------------------
    // 全てのセーブデータを走査し、対象のシーンスイッチ情報を取得する
    //-------------------------------------------------------------------------
    DataManager.isTargetSwitchTrue = function() {
        var maxSaveFiles = DataManager.maxSavefiles();
        var targetSwitchId = parameters["TARGET_SWTICH_ID"];
        var doTitleChange = false;
        if(targetSwitchId === "" || targetSwitchId === undefined) {
            return doTitleChange;
        }
        for(var i = 1; i <= maxSaveFiles; i++) {
            if(DataManager.loadGameSwitch(i)) {
                if($gameSwitches.value(targetSwitchId) ) {
                    doTitleChange = true;
                    break;
                }
            }
        }
        return doTitleChange;
    };

    //-------------------------------------------------------------------------
    // スイッチのみロードする
    //-------------------------------------------------------------------------
    DataManager.loadGameSwitch = function(savefileId) {
        try {
            return this.loadGameSwitchWithoutRescue(savefileId);
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    DataManager.loadGameSwitchWithoutRescue = function(savefileId) {
        var globalInfo = this.loadGlobalInfo();
        if (this.isThisGameFile(savefileId)) {
            var json = StorageManager.load(savefileId);
            this.createGameObjectSwitch();
            this.extractSaveContentsSwitches(JsonEx.parse(json));
            return true;
        } else {
            return false;
        }
    };
    //-------------------------------------------------------------------------
    // スイッチ用のゲームオブジェクトを作成
    //-------------------------------------------------------------------------
    DataManager.createGameObjectSwitch = function() {
        $gameSwitches      = new Game_Switches();
    };

    //-------------------------------------------------------------------------
    // スイッチ用のゲームオブジェクトにセーブデータから読み込んだデータを格納
    //-------------------------------------------------------------------------
    DataManager.extractSaveContentsSwitches = function(contents) {
        $gameSwitches      = contents.switches;
    };
})();