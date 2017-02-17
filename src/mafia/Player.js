import { LANG } from './settings/gameSettings'
import miscStrings from './strings/misc'
import _ from 'lodash'

const misc = miscStrings[LANG]

export default class Player {
  constructor(id, name, role, game) {
    this.id = id
    this.name = name
    this.role = role
    this.game = game
    this.isAlive = true
    this.isSanitized = false // janitor
    this.isDoused = false // arsonist
    this.roleBlocked = false // escort, consort
    this.protections = 0
    this.hasNightImmunity = false
    this.ignoreNightImmunity = false
    this.lastWill = ''
    this.crimes = []
    this.score = 0
    this.poll

  }

  activateNightAbility() {
    this.role.activateNightAbility(this)
  }

  resolveNightAbility(events) {
    return new Promise((resolve, reject) => {
      if (this.role.immuneToRoleBlock) {
        this.role.resolveNightAbility(this, events)
          .then(() => this.poll = null)
          .then(() => resolve(true))
      } else {
        if (this.roleBlocked) {
          this.game.postMessage(player.id, misc.roleBlocked)
            .then(() => resolve(true))
        } else {
          this.role.resolveNightAbility(this, events)
            .then(() => this.poll = null)
            .then(() => resolve(true))
        }
      }
    })
  }

  visit() {
    return new Promise((resolve, reject) => {
      this.role.visit(this)
        .then(() => resolve(true))
    })
  }

  addCrime(crime) {
    if (_.indexOf(this.crimes, crime) == -1) {
      this.crimes.push(crime)
    }
  }

  getCrimes() {
    if (this.crimes.length == 0) {
      return [misc.crimes.noCrime]
    } else {
      return this.crimes
    }
  }

  newLastWill(text) {
    this.lastWill = text
    this.showLastWill(this.id)
  }

  showLastWill(chan) {
    return new Promise((resolve, reject) => {
      let lastWill = this.lastWill.length > 0 ? this.lastWill : 'empty'
      let text = misc.lastWill(this.name)
      text = '_' + text + '_:\n ```' + lastWill + '```'
      this.game.postMessage(chan, text)
        .then(() => resolve(true))
    })
  }

}