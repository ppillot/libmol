/**
 * @file ContactEntities
 * @author Paul Pillot
 * @private
 */

import {Selection, Structure} from 'ngl'

interface ContactEntitiesTargetParameters {
  resnum: string,
  chainId:string
  seleString?: string
}

interface ContactEntitiesParameters {
  isWaterExcluded: boolean,
  isBackboneExcluded: boolean,
  radius: number,
  target: ContactEntitiesTargetParameters,
  filter: string
}

class ContactEntities {
  structure: Structure
  isWaterExcluded: boolean
  isBackboneExcluded: boolean
  neighbouringRadius: number
  targetCompleteSele: string
  targetSele: string
  targetFilter: [string, string]
  filter: string|undefined
  withinSele: string
  vicinitySele: string
  targetCloseToContact: string

  constructor (structure: Structure, params: Partial<ContactEntitiesParameters>) {
    this.structure = structure

    this.isWaterExcluded = (params.isWaterExcluded !== undefined) ? params.isWaterExcluded : true

    this.isBackboneExcluded = (params.isBackboneExcluded !== undefined) ? params.isBackboneExcluded : true

    this.neighbouringRadius = (params.radius) ? params.radius : 4.5

    this.targetCompleteSele = ''
    this.targetSele = ''
    this.targetFilter = ['', '']
    this.filter = params.filter || ''

    this.updateTarget(params.target!)

    this.withinSele = ''
    this.updateWithin()

    this.vicinitySele = ''
    this.updateVicinity()

    this.targetCloseToContact = ''
    this.updateTargetCloseToContact()
  }

  /**
   * Updates target selestring based upon params
   * based upon wether the backbone is included or not
   * Depends on :
   * - target: fixed
   * - filter: fixed
   * - isBackboneExcluded: changeable
   * @param {Object} [params] parameters: resnum, chainId, seleString
   */
  updateTarget ({resnum = '', chainId = '', seleString = ''}: Partial<ContactEntitiesTargetParameters>) {
    let s = ''
    if (seleString === '') {
      if (resnum === '' && chainId === '') {
        if (this.targetCompleteSele === '') {
          s = 'none'
        } else {
          s = this.targetCompleteSele
        }
      } else {
        s = resnum + ':' + chainId
      }
    } else s = `(${seleString})`

    this.targetCompleteSele = s
    this.targetFilter = (this.filter) ? 
      [s, this.filter] :
      [s, `not ${s}`]

    if (this.isBackboneExcluded) {
      s += ' AND NOT BACKBONE'
    }

    this.targetSele = s
  }

  /**
   * Updates selection for the atoms surrounding the target
   * it is used to search for contacts in the target vicinity
   * Depends on :
   * - target (isBackboneExcluded)
   * - radius
   * - isWaterExcluded
   */
  updateWithin () {
    const seleWithin = this.structure.getAtomSetWithinSelection(new Selection(this.targetSele), this.neighbouringRadius)
    this.withinSele = '(' + seleWithin.toSeleString() + ')'
      + ((this.isWaterExcluded) ? ' AND NOT WATER' : '')
  }

  /**
   * Updates selection for the residues surrounding the target, target excluded
   * it is used to display those residues
   * Depends on :
   * - target (isBackboneExcluded)
   * - filter
   * - withinTargetSelestring (radius, isWaterExcluded)
   */
  updateVicinity () {
    const seleGroupWithin = this.structure.getAtomSetWithinGroup(new Selection(this.withinSele))
    const filterSele = ((this.filter) ? ` AND (${this.filter})` : '')

    this.vicinitySele = `(${seleGroupWithin.toSeleString()}) and (not backbone or .CA or (PRO and .N)) and not (${this.targetCompleteSele}) ${filterSele}`
  }

  /**
   * Updates selection for the residues from the target that are in contact
   * with the surrounding. It is relevant if target is not a single residue
   * Depends on :
   * - target (isBackboneExcluded)
   * - filter
   * - withinTargetSelestring (radius, isWaterExcluded)
   */
  updateTargetCloseToContact () {
    const filterSele = ((this.filter) ? ` AND (${this.filter})` : '')
    const seleTargetContact = this.structure.getAtomSetWithinSelection(new Selection(`${this.withinSele} and not (${this.targetCompleteSele})  ${filterSele}`), this.neighbouringRadius)
    const seleGroupTargetContact = this.structure.getAtomSetWithinGroup(new Selection(`${seleTargetContact.toSeleString()} and (${this.targetCompleteSele})`))
    this.targetCloseToContact = `(${seleGroupTargetContact.toSeleString()}) and (not backbone or .CA or (PRO and .N))`
  }
  // Getters

  /**
   * Getter that returns a selection for the target
   * @returns {String} target selestring
   */
  get targetSeleString () {
    return `${this.targetCompleteSele} and (not backbone or .CA or (PRO and .N))`
  }

  /**
   * Getter that returns a selection for the atoms surronding the target, target included
   * @returns {String} within selestring
   */
  get withinTargetSeleString () {
    return this.withinSele
  }

  /**
   * Getter that returns a selection for the residues suronding the target, target excluded
   * @returns {String} vicinity selestring
   */
  get vicinitySeleString () {
    return this.vicinitySele
  }

  setParameters (params: Partial<ContactEntitiesParameters>) {
    const updates = new Set()

    if (params.hasOwnProperty('isWaterExcluded') && params.isWaterExcluded !== this.isWaterExcluded) {
      this.isWaterExcluded = params.isWaterExcluded!
      updates.add('within')
      updates.add('vicinity')
      updates.add('targetContact')
    }

    if (params.hasOwnProperty('isBackboneExcluded') && params.isBackboneExcluded !== this.isBackboneExcluded) {
      this.isBackboneExcluded = params.isBackboneExcluded!
      updates.add('target')
      updates.add('within')
      updates.add('vicinity')
      updates.add('targetContact')
    }

    if (params.hasOwnProperty('radius') && params.radius !== this.neighbouringRadius) {
      this.neighbouringRadius = params.radius!
      updates.add('within')
      updates.add('vicinity')
      updates.add('targetContact')
    }

    // this array controls the right order for updating properties values
    ([['target', this.updateTarget],
      ['within', this.updateWithin],
      ['vicinity', this.updateVicinity],
      ['targetContact', this.updateTargetCloseToContact]] as [string, ()=>void][]).forEach((val) => {
        if (updates.has(val[0])) {
          val[1].call(this)
        }
      })
  }

}

export default ContactEntities
