const min = Math.min
const max = Math.max
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
const sign = Math.sign

const ballContainer = document.getElementById("ball-container")
const scoreDisplay = document.getElementById("score-display")

const balls = {}
const updatesPerTick = 5
const dtCap = 1/10

const bounceFriction = 1 - .5
const gravity = 1

const ballSizes = [.025, .05, .075, .1, .15, .2, .25, .35];
const ballClasses = ["b1", "b2", "b3", "b4", "b5", "b5", "b5", "b5"]
const collisionRandomness = 0.000001

// loading audio
const meows = [
    ["./sfx/meow1.mp3", .08],
    ["./sfx/meow2.mp3", .4],
    ["./sfx/meow3.mp3", .2]
]


let score = 0

let lastTimeStamp = Date.now()

function createId(check)
{
    let id = ""
    for (let i = 0; i < 100; i++)
    {
        id += floor(random()*10)
    }
    if (check[id])
        return createId(check)
    return id
}

function scoreUpdate()
{
    scoreDisplay.innerHTML = ""+score
}

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
    ballObj.className = "ball "+ballClasses[size]
    ballObj.style.rotate = `${floor(random()*360)}deg`
    // ballObj.style.backgroundColor = randomColor()
    ballContainer.appendChild(ballObj)

    const ball = {
        obj: ballObj,
        x: posX,
        y: posY,
        r: .01,
        lerps: [],
        vx: 0,
        vy: 0,
        size: size,
    }

    addLerp(ball, "r", ballSizes[size], .25, quadraticEase)

    const s = meows[floor(random()*meows.length)]
    const sound = new Audio(s[0])
    sound.volume = s[1]
    sound.play()

    balls[createId(balls)] = ball
} 

// #region Physics

function circleCollisions()
{
    const sBalls = shuffle(Object.keys(balls))
    sBalls.map((ball1N, i1) => {
        const ball1 = balls[ball1N]
        if (!ball1) {return;}

        sBalls.map((ball2N, i2) => {
            const ball2 = balls[ball2N]
            if (!ball2) {return;}

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

                if (ball1.size == ball2.size)
                {
                    score += (ball1.size+1)*10
                    scoreUpdate()

                    if (ball1.size != ballSizes.length-1)
                        createBall(cx, cy, ball1.size+1)

                    ball1.obj.remove()
                    ball2.obj.remove()

                    delete balls[ball1N] 
                    delete balls[ball2N]

                    return;
                }

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

function friction(v, a, dt)
{
    return sign(v) * max(abs(v) - a*dt, 0)
}

const floorFriction = .15
function lineCollisions(dt)
{
    Object.keys(balls).map((ballN) => {
        const ball = balls[ballN]
        // Bottom
        if (ball.y+ball.r > 1)
        {
            ball.y = 1-ball.r
            ball.vy = -abs(ball.vy) * bounceFriction
            ball.vx = friction(ball.vx, floorFriction, dt)
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
    Object.keys(balls).map((ballN) => {
        const ball = balls[ballN]
        const endedLerps = []
        ball.lerps.map((lerp, i) => {
            const lerpA = min((Date.now()-lerp.start)/1000/lerp.time, 1)
            ball[lerp.property] = lerp.initial + lerp.dif*lerp.ease(lerpA)

            if (lerpA == 1)
                endedLerps.splice(0, 0, i)
        })
        endedLerps.map((index) => {
            // console.log("Ended lerp", index)
            ball.lerps.splice(index, 1)
        })
    })
}

function movementUpdate(dt)
{
    Object.keys(balls).map((ballN) => {
        const ball = balls[ballN]
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
        circleCollisions(dt)
        lineCollisions(dt)
    }
}

// #endregion

function renderBalls()
{
    Object.keys(balls).map((ballN) => {
        const ball = balls[ballN]
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

// for (let i = 0; i < 20; i++)
//     createBall(.5, .5, floor(random()*4))

ballContainer.onclick = (e) => {
    const rect = ballContainer.getBoundingClientRect()
    createBall((e.clientX-rect.left)/rect.width, 0, floor(random()*3))

    score += 5
    scoreUpdate()
}


update()
scoreUpdate()

// setInterval(() => {
//     balls.map((ball) => {
//         ball.x = .5
//         ball.y = .5
//         ball.r = .001
//         addLerp(ball, "r", ballSizes[floor(random()*4)], .25, quadraticEase)
//     })
// }, 1000)