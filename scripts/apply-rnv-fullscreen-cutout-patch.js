// 占位补丁：原仓库缺失 scripts/ 目录导致 postinstall 失败。
// 作者原始补丁从未提交到 git（已核实上游及全网 fork 均无此文件）。
// 此存根保持 npm ci 可用；如作者后续提供原版补丁，直接覆盖本文件即可。
console.log("[apply-rnv-fullscreen-cutout-patch] stub: original patch script not in repo, skipped")
