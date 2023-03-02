var canvas = document.getElementById("canvas")
canvas.width = window.innerWidth
canvas.height = window.innerHeight

window.onresize = ()=>{
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    console.log("resixe")
}

function loadScript(src, onload=()=>{}) {
    var scriptEle = document.createElement("script")
    scriptEle.src = src

    document.body.appendChild(scriptEle)

    scriptEle.onload = onload
}

function loadScripts(scripts, finalOnload=()=>{}) {
    console.log(`loading ${scripts.length} scripts`)
    var startPerf = window.performance.now()
    let loaded = 0
    for (let i = 0; i < scripts.length; i++) {
        const script = scripts[i];
        loadScript(script, ()=>{
            loaded++
            console.log(`loaded ${(loaded/scripts.length)*100}%`)
            if (loaded==scripts.length) {
                console.log(`Took ${window.performance.now()-startPerf}ms`)
                finalOnload()
            }
        })
    }
}




