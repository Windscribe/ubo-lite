/*******************************************************************************

    uBlock Origin Lite - a comprehensive, MV3-compliant content blocker
    Copyright (C) 2022-present Raymond Hill

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see {http://www.gnu.org/licenses/}.

    Home: https://github.com/gorhill/uBlock
*/

import {
    localRead, localWrite,
    sessionRead, sessionWrite,
    webextFlavor,
} from './ext.js';

/******************************************************************************/

export const rulesetConfig = {
    version: '',
    enabledRulesets: [],
    autoReload: true,
    showBlockedCount: false,
    strictBlockMode: webextFlavor !== 'safari',
    popupBlockMode: true,
    developerMode: false,
    hasBroadHostPermissions: true,
};

export const defaultConfig = Object.assign({}, rulesetConfig);

export const process = {
    firstRun: false,
    wakeupRun: false,
};

let pendingOpPromise = Promise.resolve();

/******************************************************************************/

// Windscribe: configs saved under uBOL's old `true` default must not show the badge.
function enforceShowBlockedCountOff() {
    if ( rulesetConfig.showBlockedCount === false ) { return false; }
    rulesetConfig.showBlockedCount = false;
    return true;
}

async function _loadRulesetConfig() {
    const sessionData = await sessionRead('rulesetConfig');
    if ( sessionData ) {
        Object.assign(rulesetConfig, sessionData);
        process.wakeupRun = true;
        if ( enforceShowBlockedCountOff() ) {
            sessionWrite('rulesetConfig', rulesetConfig);
            localWrite('rulesetConfig', rulesetConfig);
        }
        return;
    }
    const localData = await localRead('rulesetConfig');
    if ( localData ) {
        Object.assign(rulesetConfig, localData)
        if ( enforceShowBlockedCountOff() ) {
            localWrite('rulesetConfig', rulesetConfig);
        }
        sessionWrite('rulesetConfig', rulesetConfig);
        return;
    }
    sessionWrite('rulesetConfig', rulesetConfig);
    localWrite('rulesetConfig', rulesetConfig);
    process.firstRun = true;
}

async function _saveRulesetConfig() {
    sessionWrite('rulesetConfig', rulesetConfig);
    return localWrite('rulesetConfig', rulesetConfig);
}

/******************************************************************************/

export function loadRulesetConfig() {
    pendingOpPromise = pendingOpPromise.then(_loadRulesetConfig);
    return pendingOpPromise;
}

export function saveRulesetConfig() {
    pendingOpPromise = pendingOpPromise.then(_saveRulesetConfig);
    return pendingOpPromise;
}
