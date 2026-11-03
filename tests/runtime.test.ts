import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {findBrowserExecutable,mediaExecutable} from '../server/runtime';

test('Windows usa o Chrome instalado e evita baixar outro navegador',()=>{
 const env={PROGRAMFILES:'C:\\Program Files',LOCALAPPDATA:'C:\\Users\\Teste\\AppData\\Local'};
 const chrome=path.join(env.PROGRAMFILES,'Google','Chrome','Application','chrome.exe');
 assert.equal(findBrowserExecutable(env,'win32',file=>file===chrome),chrome);
});

test('CHROMIUM_PATH e caminhos de mídia configurados têm prioridade',()=>{
 assert.equal(findBrowserExecutable({CHROMIUM_PATH:'D:\\Chrome\\chrome.exe'},'win32',()=>false),'D:\\Chrome\\chrome.exe');
 assert.equal(mediaExecutable('ffmpeg',{FFMPEG_PATH:'D:\\ffmpeg.exe'}),'D:\\ffmpeg.exe');
 assert.equal(mediaExecutable('ffprobe',{FFPROBE_PATH:'D:\\ffprobe.exe'}),'D:\\ffprobe.exe');
});
