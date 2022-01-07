import Ambient from 'ambient-lib'
import got from 'got'
import cron from 'node-cron'
import dotenv from 'dotenv'

dotenv.config()

const am = new Ambient(process.env.AMBIENT_CHANNEL, '_', process.env.AMBIENT_READ_KEY)

let isNotify = false

cron.schedule('0,30 * * * * *', () => {
    am.read({n: 10}, (res) => {
        let avg = res.data.reduce((prev, curr) => prev += curr.d1, 0) / res.data.length
        if (!isNotify && avg > 920) {
            try {
                got.post(process.env.DISCORD_HOOK, {
                    json: {
                        content: `<@260853260775194624> 換気して`,
                        embeds: [{
                            fields: [
                                {
                                    name: 'CO2',
                                    value: `${avg}ppm`
                                }
                            ]
                        }]
                    }
                })
                isNotify = true
            } catch (err) {
                console.log(err)
            }
        } else if (isNotify && avg < 750) {
            try {
                got.post(process.env.DISCORD_HOOK, {
                    json: {
                        content: `<@260853260775194624> 終了!!`,
                        embeds: [{
                            fields: [
                                {
                                    name: 'CO2',
                                    value: `${avg}ppm`
                                }
                            ]
                        }]
                    }
                })
                isNotify = false
            } catch (err) {
                console.log(err)
            }
        }
        console.log(avg)
    })    
})

