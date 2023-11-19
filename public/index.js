const min = Math.min
const abs = Math.abs
const floor = Math.floor
const random = Math.random
const randF = () => {return random()*2-1}
const sqrt = Math.sqrt
const hypot = Math.hypot
const atan2 = Math.atan2
const sin = Math.sin
const cos = Math.cos
const pi = Math.PI

const ballContainer = document.getElementById("ball-container")

const balls = []
const updatesPerTick = 5
const dtCap = 1/10

const bounceFriction = 1 - .5
const gravity = 1

const ballSizes = [.025, .05, .075, .1];
const collisionRandomness = 0.000001

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

            const rx1 = ball1.x + randF()*collisionRandomness
            const ry1 = ball1.y + randF()*collisionRandomness
            const rx2 = ball2.x + randF()*collisionRandomness
            const ry2 = ball2.y + randF()*collisionRandomness

            const supposedDistance = ball1.r+ball2.r
            const distance = hypot((rx1-rx2), (ry1-ry2))

            if (distance < supposedDistance)
            {
                // Colision
                const cx = (rx1+rx2)/2
                const cy = (ry1+ry2)/2
                const cxv = (rx1-rx2)/distance
                const cyv = (ry1-ry2)/distance

                const spacingDistance = supposedDistance/2 + .0001
                const dampener = .9

                ball1.x = cx + cxv*spacingDistance
                ball1.y = cy + cyv*spacingDistance
                ball2.x = cx - cxv*spacingDistance
                ball2.y = cy - cyv*spacingDistance

                const theta1 = atan2(ball1.vy, ball1.vx)
                const theta2 = atan2(ball2.vy, ball2.vx)
                const omega = atan2(cyv, cxv)

                const v1 = hypot(ball1.vx, ball1.vy)
                const v2 = hypot(ball2.vx, ball2.vy)

                const m1 = ball1.r*ball1.r
                const m2 = ball2.r*ball2.r

                const v1fxr = (v1*cos(theta1-omega)*(m1-m2) + 2*m2*v2*cos(theta2-omega))/(m1+m2)
                const v2fxr = (v2*cos(theta2-omega)*(m2-m1) + 2*m1*v1*cos(theta1-omega))/(m1+m2)

                const v1fyr = v1*sin(theta1-omega)
                const v2fyr = v2*sin(theta2-omega)

                ball1.vx = (v1fxr * cos(omega) + v1fyr * cos(omega + pi/2)) * dampener
                ball1.vy = (v1fxr * sin(omega) + v1fyr * sin(omega + pi/2)) * dampener
                ball2.vx = (v2fxr * cos(omega) + v2fyr * cos(omega + pi/2)) * dampener
                ball2.vy = (v2fxr * sin(omega) + v2fyr * sin(omega + pi/2)) * dampener
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

        // Left
        if (ball.x-ball.r < 0)
        {
            ball.x = 0+ball.r
            ball.vx = -abs(ball.vx) * bounceFriction
        }

        // Right
        if (ball.x+ball.r > 1)
        {
            ball.x = 1-ball.r
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
            ball.lerps.splice(index, 1)
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

for (let i = 0; i < 100; i++)
    createBall(.5, .5, floor(random()*4))


update()

// setInterval(() => {
//     balls.map((ball) => {
//         ball.x = .5
//         ball.y = .5
//         ball.r = .001
//         addLerp(ball, "r", ballSizes[floor(random()*4)], .25, quadraticEase)
//     })
// }, 1000)