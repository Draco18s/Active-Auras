class AAhelpers {
    /**
     * 
     * @param {object} entity entity to check
     * @param {string} scope scope to check
     * @returns 
     */
    static GetAllFlags(entity, scope) {
        {
            const scopes = SetupConfiguration.getPackageScopes()
            if (!scopes.includes(scope)) throw new Error(`Invalid scope`)
            return getProperty(entity.data.flags, scope)
        }
    }

    /**
     * 
     * @param {*} token 
     * @param {*} sceneID 
     * @returns 
     */
    static IsAuraToken(token, sceneID) {
        let MapKey = sceneID
        let MapObject = AuraMap.get(MapKey)
        if (!MapObject?.effects) return false
        for (let effect of MapObject.effects) {
            if (effect.entityId === token.id) return true
        }
        return false
    }

    static DispositionCheck(auraTargets, auraDis, tokenDis) {
        switch (auraTargets) {
            case "Allies": {
                if (auraDis !== tokenDis) return false
                else return true
            }
            case "Enemy": {
                if (auraDis === tokenDis) return false
                else return true
            }
            case "All": return true
        }
    }

    static CheckType(canvasToken, type) {
        switch (game.system.id) {
            case ("dnd5e"): 
            case ("pf1"): return AAhelpers.typeCheck5e(canvasToken, type)
            case ("sw5e"): return AAhelpers.typeCheck5e(canvasToken, type)
            case ("swade"): return AAhelpers.typeCheckSWADE(canvasToken, type)
        }
    }
    static typeCheck5e(canvasToken, type) {
        let tokenType
        switch (canvasToken.actor.data.type) {
            case "npc": {
                try {
                    tokenType = [canvasToken.actor?.data.data.details.type.value, canvasToken.actor?.data.data.details.type.custom]
                } catch (error) {
                    console.error([`ActiveAuras: the token has an unreadable type`, canvasToken])
                }
            }
                break
            case "character": {
                try {
                    if (game.system.data.name === "pf1") {
                        tokenType = actor.race.data.data.creatureType.toLowerCase()
                    }
                    else if (game.system.data.name === "sw5e") {
                        tokenType = canvasToken.actor?.data.data.details.species.toLowerCase()
                    }
                    else tokenType = [canvasToken.actor?.data.data.details.race.toLowerCase().replace("-", " ").split(" ")]
                } catch (error) {
                    console.error([`ActiveAuras: the token has an unreadable type`, canvasToken])
                }
            }
                break
            case "vehicle": return
        }
        let humanoidRaces
        if (game.system.data.name === "sw5e") {
            humanoidRaces = ["abyssin", "aingtii", "aleena", "anzellan", "aqualish", "arcona", "ardennian", "arkanian", "balosar", "barabel", "baragwin", "besalisk", "bith", "bothan", "cathar", "cerean", "chadrafan", "chagrian", "chevin", "chironian", "chiss", "clawdite", "codruji", "colicoid", "dashade", "defel", "devoronian", "draethos", "dug", "duros", "echani", "eshkha", "ewok", "falleen", "felucian", "fleshraider", "gamorrean", "gand", "geonosian", "givin", "gotal", "gran", "gungan", "halfhuman", "harch", "herglic", "ho’din", "human", "hutt", "iktotchi", "ithorian", "jawa", "kage", "kaleesh", "kaminoan", "karkarodon", "keldor", "killik", "klatooinian", "kubaz", "kushiban", "kyuzo", "lannik", "lasat", "lurmen", "miraluka", "mirialan", "moncalamari", "mustafarian", "muun", "nautolan", "neimoidian", "noghri", "ortolan", "patrolian", "pau’an", "pa’lowick", "pyke", "quarren", "rakata", "rattataki", "rishii", "rodian", "ryn", "selkath", "shistavanen", "sithpureblood", "squib", "ssiruu", "sullustan", "talz", "tarasin", "thisspiasian", "togorian", "togruta", "toydarian", "trandoshan", "tusken", "twi'lek", "ugnaught", "umbaran", "verpine", "voss", "vurk", "weequay", "wookie", "yevetha", "zabrak", "zeltron", "zygerrian"]
        }
		else if (game.system.data.name === "pf1") {
            humanoidRaces = ["human", "orc", "elf", "gnome", "dwarf", "half-elf", "halfling", "half-orc", "catfolk", "dhampir", "drow", "goblin", "hobgoblin", "kobold", "ratfolk", "tengu", "changeling", "duergar", "gillman", "grippli", "kitsune", "merfolk", "nagaji", "samsaran", "strix", "svirfneblin", "vanara", "vishkanya", "wayang", "android", "monkey goblin", "lashunta"]
        }
        else humanoidRaces = ["human", "orc", "elf", "tiefling", "gnome", "aaracokra", "dragonborn", "dwarf", "halfling", "leonin", "satyr", "genasi", "goliath", "aasimar", "bugbear", "firbolg", "goblin", "lizardfolk", "tabxi", "triton", "yuan-ti", "tortle", "changling", "kalashtar", "shifter", "warforged", "gith", "centaur", "loxodon", "minotaur", "simic hybrid", "vedalken", "verdan", "locathah", "grung"]

        if (tokenType.includes(type)) return true

        for (let x of tokenType) {
            if (humanoidRaces.includes(x)) {
                tokenType = "humanoid"
                continue
            }
        }
        if (tokenType === type || tokenType === "any") return true
        return false
    }

    static typeCheckSWADE(canvasToken, type) {
        let tokenType
        switch (canvasToken.actor.data.type) {
            case "npc": {
                try {
                    tokenType = canvasToken.actor?.data.data.details.species.name.toLowerCase()
                } catch (error) {
                    console.error([`ActiveAuras: the token has an unreadable type`, canvasToken])
                }
            }
                break
            case "character": {
                try {
                    tokenType = canvasToken.actor?.data.data.details.species.name.toLowerCase()
                } catch (error) {
                    console.error([`ActiveAuras: the token has an unreadable type`, canvasToken])
                }
            }
                break
            case "vehicle": return
        }
        return tokenType === type
    }

    static Wildcard(canvasToken, wildcard, extra) {
        if (game.system.id !== "swade") return true
        let Wild = canvasToken.actor.isWildcard
        if (Wild && wildcard) return true
        else if (!Wild && extra) return true
        else return false
    }

    static HPCheck(token) {
        switch (game.system.id) {
            case "dnd5e": 
            case "pf1":
            case "sw5e": {
                if (getProperty(token, "actor.data.data.attributes.hp.value") <= 0) return false
                else return true
            }
            case "swade": {
                let { max, value, ignored } = token.actor.data.data.wounds
                if (value - ignored >= max) return false
                else return true
            }
        }
    }

    static ExtractAuraById(entityId, sceneID) {
        if (!AAgm) return
        let MapKey = sceneID
        let MapObject = AuraMap.get(MapKey)
        let effectArray = MapObject.effects.filter(e => e.entityId !== entityId)
        AuraMap.set(MapKey, { effects: effectArray })
        AAhelpers.RemoveAppliedAuras(canvas)
    }

    static async RemoveAppliedAuras() {
        let EffectsArray = []
        let MapKey = canvas.scene.id
        let MapObject = AuraMap.get(MapKey)
        MapObject.effects.forEach(i => EffectsArray.push(i.data.origin))

        for (let removeToken of canvas.tokens.placeables) {
            if (removeToken?.actor?.effects.size > 0) {
                for (let testEffect of removeToken.actor.effects) {
					if(game.system.id == "pf1" && !EffectsArray.includes(testEffect.data.origin) && testEffect.data.origin != undefined) {
						let itemSource = AAhelpers.ResolveSource(testEffect.data.origin)
						let effectId = itemSource?.data?.flags?.ActiveAuras?.effectid
						if(effectId && !EffectsArray.some(x => AAhelpers.ResolveSource(x).data.effects.has(effectId))) {
							removeToken.actor.deleteEmbeddedDocuments("Item", itemSource.id)
						}
					}
                    else if (!EffectsArray.includes(testEffect.data.origin) && testEffect.data?.flags?.ActiveAuras?.applied) {
                        await removeToken.actor.deleteEmbeddedDocuments("ActiveEffect", [testEffect.id])
                        console.log(game.i18n.format("ACTIVEAURAS.RemoveLog", { effectDataLabel: testEffect.data.label, tokenName: removeToken.name }))
                    }
                }
            }
        }
    }

	static ResolveSource(origin) {
		let[sourceOwnerType, sourceOwnerID, sourceType, sourceID] = origin.split('.')
		if(sourceOwnerType != "Actor") return null
		let actorSource = game.pf1.utils.getActorFromId(sourceOwnerID)
		if(actorSource == null) return null
		return actorSource.data.items.get(sourceID)
	}

    static async RemoveAllAppliedAuras() {
        for (let removeToken of canvas.tokens.placeables) {
            if (removeToken?.actor?.effects.size > 0) {
				if(game.system.id == "pf1") {
					for (let eff of testEffect.data._source.changes) {
						if(eff.parent.id == testEffect.id) {
							removeToken.actor.changes.delete(eff.id)
						}
					}
				}
				else {
					let effects = removeToken.actor.effects.reduce((a, v) => { if (v.data?.flags?.ActiveAuras?.applied) return a.concat(v.id) }, [])
                	await removeToken.actor.deleteEmbeddedDocuments("ActiveEffect", effects)
                }
                console.log(game.i18n.format("ACTIVEAURAS.RemoveLog", { tokenName: removeToken.name }))
            }
        }
    }

    static UserCollateAuras(sceneID, checkAuras, removeAuras, source) {
        let AAGM = game.users.find((u) => u.isGM && u.active)
        AAsocket.executeAsUser("userCollate", AAGM.id, sceneID, checkAuras, removeAuras, source)
    }

    /**
     * Bind a filter to the ActiveEffect.apply() prototype chain
     */

    static applyWrapper(wrapped, ...args) {
        let actor = args[0]
        let change = args[1]
        if (change.effect.data.flags?.ActiveAuras?.ignoreSelf) {
            console.log(game.i18n.format("ACTIVEAURAS.IgnoreSelfLog", { effectDataLabel: change.effect.data.label, changeKey: change.key, actorName: actor.name }))
            args[1] = {}
            return wrapped(...args)
        }
		/*if(game.system.id == "pf1") {
			for (let eff of change.effect.data._source.changes) {
				let newchange = game.pf1.documentComponents.ItemChange.create({
					formula: eff.formula,
					target: eff.target,
					subTarget: eff.subTarget,
					modifier: eff.modifier,
					source: change.effect.data.label,
				})
				actor?.changes?.set(
					newchange.id,
					newchange
				)
			}
		}*/
        return wrapped(...args)
    }

    static scrollingText(wrapped, ...args) {
        if (game.settings.get("ActiveAuras", "scrollingAura")) {
            if (this.data.flags["ActiveAuras"]?.applied) { this.isSuppressed = true }
        }
        return wrapped(...args)
    }

    static async applyTemplate(args) {

        let duration
        const convertedDuration = globalThis.DAE.convertDuration(args[0].itemData.data.duration, true)
        if (convertedDuration?.type === "seconds") {
            duration = { seconds: convertedDuration.seconds, startTime: game.time.worldTime }
        }
        else if (convertedDuration?.type === "turns") {
            duration = {
                rounds: convertedDuration.rounds,
                turns: convertedDuration.turns,
                startRound: game.combat?.round,
                startTurn: game.combat?.turn
            }
        }
        let template = canvas.templates.get(args[0].templateId)
        let disposition = args[0].actor.token.disposition
        let effects = args[0].item.effects
        let templateEffectData = []
        for (let effect of effects) {
            let data = { data: duplicate(effect), parentActorId: false, parentActorLink: false, entityType: "template", entityId: template.id, casterDisposition: disposition, castLevel: args[0].spellLevel }
            if (effect.flags["ActiveAuras"].displayTemp) { data.data.duration = duration }
            data.data.origin = `Actor.${args[0].actor._id}.Item.${args[0].item._id}`
            templateEffectData.push(data)
        }
        await template.document.setFlag("ActiveAuras", "IsAura", templateEffectData)
        AAhelpers.UserCollateAuras(canvas.scene.id, true, false, "spellCast")
        return { haltEffectsApplication: true }

    }

	static buildEffectsHtmlEditor(tabs, section, sheet, pfItem) {
		if(pfItem.data.constructor.name != "ItemData") return
		if(pfItem.data.effects.some(ef => ef.data.effectid)) return

		let effect = null
		for(let ef of pfItem.data.effects) {
			if(!ef.data.flags?.ActiveAuras?.isAura) continue
			if(effect == null) effect = ef
			break
		}
		renderTemplate(ActiveAuras.TEMPLATES.EFFECTS, {
			auraflags: {
				aura: (effect ? effect.data.flags.ActiveAuras.aura : "Allies"),
				radius: (effect ? effect.data.flags.ActiveAuras.radius : 0),
				ignoreSelf: (effect ? effect.data.flags.ActiveAuras.ignoreSelf : false),
				alignment: (effect ? effect.data.flags.ActiveAuras.alignment : ""),
				owner: sheet.isOwner,
			},
			effects: effect?.data?.flags?.ActiveAuras?.changes
		}).then(
			html => {
				tabs.append('<a class="item" data-tab="effects">Effects</a>')
				let domObj = section.append(html)
				domObj.on('click', '.add-change', (event) => {
					console.log("add change click")
					if(!effect.data.flags.ActiveAuras) {
						effect.data.flags.ActiveAuras = {
							aura: "Allies",
							radius: 30,
							isAura: true,
							inactive: false,
							hidden: false,
							ignoreSelf: false,
							height: false,
							alignment: "",
							type: "",
							save: "",
							savedc: null,
							hostile: false,
							onlyOnce: false,
							time: "None",
							displayTemp: false
						}
					}
					if(!effect.data.flags.ActiveAuras.effectid) {
						effect.data.flags.ActiveAuras.effectid = makeid(16)
					}
					if(!effect.data.flags.ActiveAuras.changes) {
						effect.data.flags.ActiveAuras.changes = [{
							_id: makeid(8),
							formula: "",
							operator: "add",
							subTarget: "",
							modifier: "untyped",
							priority: 0,
							value: 0
						}]
					}
					const changes = duplicate(pfItem.data.effects)
					pfItem.update({ "data.effects" : changes })
				})
				domObj.on('click', '.delete-change', (event) => {
					console.log("delete change click")
					const li = a.closest(".change")
					const changes = duplicate(pfItem.data.effects)
					const change = changes[pfItem.data.effects.indexOf(effect)].data.flags.ActiveAuras.changes.find((o) => o._id === li.dataset.change)
					changes.splice(changes.indexOf(change), 1)
					pfItem.update({ "data.effects" : changes })
					//return sheet._onSubmit(event, { updateData: { "data.effects": changes } })
				})
				domObj.on('blur', 'input', (event) => {
					console.log("blur click")
					//sheet._onChangeInput.bind(pfItem)
				})
				domObj.on('change', 'select', (event) => {
					console.log("select change click")
					//sheet._onChangeInput.bind(pfItem)
				})
			}
		)
	}

	static makeid(length) {
		var result           = ''
		var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
		var charactersLength = characters.length
		for ( var i = 0; i < length; i++ ) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength))
		}
		return result
	}
}