import { NIGHT_ACTIVITY, LANG } from '../settings/gameSettings'
import ConsortStrings from '../strings/roles/consort'
import miscStrings from '../strings/misc'
import Poll from '../Poll'
import { sleep } from '../utils'
import _ from 'lodash'

const str = new ConsortStrings(LANG)
const misc = miscStrings[LANG]

let consort = {
  name: 'Consort',
  affiliation: 'Mafia',
  category: 'Mafia Support',
  desc: {
    name: str.desc('name'),
    particle: str.desc('particle'),
    summary: str.desc('summary'),
    goal: str.desc('goal'),
    nightAbility: str.desc('nightAbility')
  },
  params: {
    isUnique: false,
    investigationCop: misc.investigation.mafia
  },

  activatePreNightAbility() {

  },

  activateNightAbility(player) {
    const chan = player.id
    const text = str.activateNightAbility()
    const choices = player.game.getPlayers({ except: player.name })
    let poll = new Poll(player.game, chan, text, choices)
    poll.start()
    sleep(NIGHT_ACTIVITY)
      .then(() => poll.end())
      .then(() => player.poll = poll)
      .then(() => player.visit())
  },

  resolveNightAbility(player) {
    return new Promise((resolve, reject) => {
      const resPoll = player.poll.getMaxVoted()
      let text
      if (resPoll.maxVote > 0) {
        const target = _.find(player.game.players, { name: resPoll.targets[0] })
        switch (target.role.name) {
          case 'Escort':
          case 'Consort':
            break
          case 'SerialKiller':
            player.game.gameEmitter.emit('nightEvent', {
              type: 'kill',
              player: target.name,
              target: player.name,
              killType: 'serialkiller'
            })
            target.roleBlocked = true
            target.cancelVisit()
            player.addCrime(misc.crimes.disturbingThePeace)
          default:
            target.roleBlocked = true
            target.cancelVisit()
            player.addCrime(misc.crimes.disturbingThePeace)
        }
        text = str.resolveNightAbility('block', target.name)
      } else {
        text = str.resolveNightAbility('noBlock')
      }
      player.game.postMessage(player.id, text)
        .then(() => resolve(true))
    })
  },

  visit(player) {
    return new Promise((resolve, reject) => {
      const resPoll = player.poll.getMaxVoted()
      if (resPoll.maxVote > 0) {
        const target = _.find(player.game.players, { name: resPoll.targets[0] })
        player.game.gameEmitter.emit('nightEvent', {
          type: 'visit',
          player: player.name,
          target: target.name
        })
        player.addCrime(misc.crimes.soliciting)

      }
      resolve(true)
    })
  }
}

export default consort
