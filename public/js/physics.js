const updatesPerTick = 5
const bounceFriction = 1 - .5
const gravity = 1
const collisionRandomness = 0.000001
const floorFriction = .15

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

const linearEase = (x) => {return x;}
const quadraticEase = (x) => {return x*x;}

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

function friction(v, a, dt)
{
    return sign(v) * max(abs(v) - a*dt, 0)
}

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

class PhysicsBall
{
    constructor(x, y, r)
    {
        this.x = x
        this.y = y
        this.r = r

        this.can_collide = true
        this.anchored = false

        this.vx = 0
        this.vy = 0

        this.lerps = []
    }

    movementUpdate(ax, ay, dt)
    {
        this.x += this.vx*dt + .5*ax*dt*dt
        this.y += this.vy*dt + .5*ay*dt*dt
        this.vx += ax*dt
        this.vy += ay*dt
    }

    setCanCollide(toggle)
    {
        this.can_collide = toggle
    }

    setAnchored(toggle)
    {
        this.anchored = toggle
    }

    addLerp(property, target, time, ease=linearEase)
    {
        this.lerps.push({
            property: property,
            initial: this[property],
            target: target,
            dif: target - this[property],
            start: Date.now(),
            time: time,
            ease: ease
        })

    }
}

class Universe
{

    balls = {}
    lines = []
    #on_collision = () => {}

    constructor()
    {
        
    }

    addBall(id, ball)
    {
        this.balls[id] = ball
    }

    setOnCollision(on)
    {
        this.#on_collision = on
    }

    handleLerps(dt)
    {
        Object.keys(this.balls).map((ballN) => {
            const ball = this.balls[ballN]
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

    circleCollisions()
    {
        const keys = []
        Object.keys(this.balls).map((key) => {
            if (this.balls[key].can_collide)
                keys.push(key)
        })
        const sBalls = shuffle(keys)
        for (let i = 0; i < sBalls.length; i++)
        {
            const ball1 = this.balls[sBalls[i]]
            if (!ball1) {return;}

            for (let j = i+1; j < sBalls.length; j++)
            {
                const ball2 = this.balls[sBalls[j]]
                if (!ball2 || !this.balls[sBalls[i]]) {return;}

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

                    this.#on_collision(sBalls[i], sBalls[j], cx, cy)

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
            }
        }
    }

    physicsUpdate(dt)
    {
        const update_start = Date.now()
        this.handleLerps(dt)
        this.movementUpdate(dt)
        for (let i = 0; i < updatesPerTick; i++)
        {
            this.circleCollisions(dt)
            this.lineCollisions(dt)
        }
        
        // console.log("Physics time", (Date.now()-update_start)/1000)
    }

    lineCollisions(dt)
    {
        Object.keys(this.balls).map((ballN) => {
            const ball = this.balls[ballN]
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
                ball.x = 0+ball.r+collisionRandomness
                ball.vx = abs(ball.vx) * bounceFriction
                // console.log()
            }

            // Right
            if (ball.x+ball.r > 1)
            {
                ball.x = 1-ball.r-collisionRandomness
                ball.vx = -abs(ball.vx) * bounceFriction
            }
        })
    }

    movementUpdate(dt)
    {
        Object.keys(this.balls).map((ballN) => {
            const ball = this.balls[ballN]
            const ax = 0
            const ay = gravity

            if (ball.anchored) {return;}

            ball.movementUpdate(ax, ay, dt)
        })
    }
}

export { Universe, PhysicsBall, linearEase, quadraticEase }