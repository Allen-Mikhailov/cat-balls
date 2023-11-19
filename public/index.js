const min = Math.min
const abs = Math.abs
const floor = Math.floor
const random = Math.random

const ballContainer = document.getElementById("ball-container")

const balls = []
const updatesPerTick = 3
const dtCap = 1/10

const bounceFriction = 1 - .5
const gravity = 1

const ballSizes = [.05, .10, .15, .20];

let lastTimeStamp = Date.now()

function randomColor()
{
    return `rgb(
        ${100+floor(random()*156)}, 
        ${100+floor(random()*156)}, 
        ${100+floor(random()*156)})`
}

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex > 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
}
  

const linearEase = (x) => {return x;}
const quadraticEase = (x) => {return x*x;}

function addLerp(ball, property, target, time, ease=linearEase)
{
    ball.lerps.push({
        property: property,
        initial: ball[property],
        target: target,
        dif: target - ball[property],
        start: Date.now(),
        time: time,
        ease: ease
    })

}

function createBall(posX=.5, posY=0, size=0)
{
    const ballObj = document.createElement("div")
    ballObj.className = "ball"
    ballObj.style.backgroundColor = randomColor()
    ballContainer.appendChild(ballObj)

    const ball = {
        obj: ballObj,
        x: posX,
        y: posY,
        r: .01,
        lerps: [],
        vx: 0,
        vy: 0
    }

    addLerp(ball, "r", ballSizes[size], .25, quadraticEase)

    balls.push(ball)
} 

// #region Physics

function circleCollisions()
{
    const sBalls = shuffle(balls)
    sBalls.map((ball1, i1) => {
        sBalls.map((ball2, i2) => {
            if (i1 == i2) {return;}

            const distance = Math.sqrt(
                (ball1.x-ball2.x)*(ball1.x-ball2.x) + 
                (ball1.y-ball2.y)*(ball1.y-ball2.y)
                )

            if (distance < ball1.r+ball2.r)
            {
                // Colision
                const cx = (ball1.x+ball2.x)/2
                const cy = (ball1.x+ball2.x)/2
                const cxv = (ball1.x-ball2.x)/distance
                const cyv = (ball1.y-ball2.y)/distance

            }
        })
    })
}

function lineCollisions()
{
    balls.map((ball) => {
        // Bottom
        if (ball.y+ball.r > 1)
        {
            ball.y = 1-ball.r
            ball.vy = -abs(ball.vy) * bounceFriction
        }

        // Right
        if (ball.x-ball.r < 0)
        {
            ball.x = 1-ball.r
            ball.vx = -abs(ball.vx) * bounceFriction
        }

        // Right
        if (ball.x+ball.r > 1)
        {
            ball.x = 0+ball.r
            ball.vx = abs(ball.vx) * bounceFriction
        }
    })
}

function handleLerps(dt)
{
    balls.map((ball) => {
        const endedLerps = []
        ball.lerps.map((lerp, i) => {
            const lerpA = min((Date.now()-lerp.start)/1000/lerp.time, 1)
            ball[lerp.property] = lerp.initial + lerp.dif*lerp.ease(lerpA)

            if (lerpA == 1)
                endedLerps.splice(0, 0, i)
        })
        endedLerps.map((index) => {
            console.log("Ended lerp", index)
            endedLerps.splice(index, 1, 0)
        })
    })
}

function movementUpdate(dt)
{
    balls.map((ball) => {
        const ax = 0
        const ay = gravity

        ball.x += ball.vx*dt + .5*ax*dt*dt
        ball.y += ball.vy*dt + .5*ay*dt*dt
        ball.vx += ax*dt
        ball.vy += ay*dt
    })
}

function physicsUpdate(dt)
{
    handleLerps(dt)
    movementUpdate(dt)
    for (let i = 0; i < updatesPerTick; i++)
    {
        circleCollisions()
        lineCollisions()
    }
}

// #endregion

function renderBalls()
{
    balls.map((ball) => {
        ball.obj.style.left = `${(ball.x) * 100}%`
        ball.obj.style.top = `${(ball.y) * 100}%`
        ball.obj.style.width = `${ball.r * 2 *  100}%`
    })
}

function update()
{
    const t = Date.now()
    const dt = min(dtCap, (t-lastTimeStamp)/1000)
    lastTimeStamp = t

    physicsUpdate(dt)
    renderBalls()
    requestAnimationFrame(update)
}

for (let i = 0; i < 10; i++)
    createBall(.1 + random()*.8, 0, 0)


update()