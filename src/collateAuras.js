async function CollateAuras(sceneID, checkAuras, removeAuras, source) {
    if (!AAgm) return;
    if (sceneID !== canvas.id) return ui.notifications.warn("Collate Auras called on a non viewed scene, auras will be updated when you return to that scene")
    let MapKey = sceneID;
    let MapObject = AuraMap.get(MapKey);
    let effectArray = [];
    for (let t of canvas.tokens.placeables) {
        let testToken = t.document
        //Skips over null actor tokens
        if (testToken.actor === null || testToken.actor === undefined) continue;
        //Skips over MLT coppied tokens
        if (testToken.data.flags["multilevel-tokens"]) continue

        if (!AAhelpers.HPCheck(testToken) && game.settings.get("ActiveAuras", "dead-aura")) {
            if (AAdebug) console.log(`Skipping ${testToken.name}, 0hp`)
            continue
        }
		let effectsArray = (game.system.id == "pf1" ? GetPathfinderEffects(testToken?.actor) : testToken?.actor?.effects.contents)
        for (let testEffect of effectsArray) {
            if (testEffect.data.flags?.ActiveAuras?.isAura) {
                if (testEffect.data.disabled) continue;
				let newEffect = {
					label: testEffect.label,
					origin: testEffect.origin,
					data: duplicate(testEffect.data),
					parentActorLink: testEffect.parent.data.token.actorLink,
					parentActorId: testEffect.parent.id,
					entityType: "token",
					entityId: testToken.id
				}
                let re = /@[\w\.]+/g
                let rollData = testToken.actor.getRollData()

                for (let change of newEffect.data.changes) {
                    if (typeof change.value !== "string") continue
                    let s = change.value
                    for (let match of s.match(re) || []) {
                        if (s.includes("@@")) {
                            s = s.replace(match, match.slice(1))
                        }
                        else {
                            s = s.replace(match, getProperty(rollData, match.slice(1)))
                        }
                    }
                    change.value = s
                    if (change.key === "macro.execute" || change.key === "macro.itemMacro") newEffect.data.flags.ActiveAuras.isMacro = true
                }
                newEffect.data.disabled = false
                let macro = newEffect.data.flags.ActiveAuras.isMacro !== undefined ? newEffect.data.flags.ActiveAuras.isMacro : false;
				newEffect.data.img = testEffect.data.img;
				newEffect.data.flags.ActiveAuras.isAura = false;
                newEffect.data.flags.ActiveAuras.applied = true;
                newEffect.data.flags.ActiveAuras.isMacro = macro;
                newEffect.data.flags.ActiveAuras.ignoreSelf = false;
                if (testEffect.data.flags.ActiveAuras?.hidden && testToken.data.hidden) newEffect.data.flags.ActiveAuras.Paused = true;
                else newEffect.data.flags.ActiveAuras.Paused = false;
				effectArray.push(newEffect)
            }
        }
    }
    await RetrieveDrawingAuras(effectArray)
    await RetrieveTemplateAuras(effectArray)
    if (MapObject) {
        MapObject.effects = effectArray
    }
    else {
        AuraMap.set(MapKey, { effects: effectArray })
    }


    if (AAdebug) console.log(AuraMap)

    if (checkAuras) {
        ActiveAuras.MainAura(undefined, "Collate auras", canvas.id)
    }
    if (removeAuras) {
        AAhelpers.RemoveAppliedAuras(canvas)
    }
}

function GetPathfinderEffects(pf1Actor) {
	let effects = [];
	for (let pfItem of pf1Actor.data.items) {
		let changes = pfItem.getFlag("ActiveAuras", "changes")
		if(changes) {
			effects.push({
				data: {
					flags:duplicate(pfItem.data.flags),
					disabled: pfItem.data.data.disabled,
					img:pfItem.data.img,
					changes:duplicate(changes)
				},
				label:pfItem.name,
				parent:pfItem.parent,
				origin:`Actor.${pf1Actor.id}.Item.${pfItem.id}`
			});
		}
	}
	return effects;
}

function RetrieveTemplateAuras(effectArray) {
    let auraTemplates = canvas.templates.placeables.filter(i => i.data.flags?.ActiveAuras?.IsAura !== undefined)

    for (let template of auraTemplates) {
        for (let testEffect of template.data.flags?.ActiveAuras?.IsAura) {
            if (testEffect.disabled) continue;
            let newEffect = duplicate(testEffect)
            const parts = testEffect.data.origin.split(".")
            const [entityName, entityId, embeddedName, embeddedId] = parts;
            let actor = game.actors.get(entityId)
            let rollData = actor.getRollData()
            rollData["item.level"] = getProperty(testEffect, "castLevel")
            Object.assign(rollData, { item: { level: testEffect.castLevel } })
            let re = /@[\w\.]+/g
            for (let change of newEffect.data.changes) {
                if (typeof change.value !== "string") {
					continue
				}
                let s = change.value
                for (let match of s.match(re) || []) s = s.replace(match, getProperty(rollData, match.slice(1)))
                change.value = s
                if (change.key === "macro.execute" || change.key === "macro.itemMacro") newEffect.data.flags.ActiveAuras.isMacro = true
            }
            newEffect.disabled = false
            let macro = newEffect.data.flags.ActiveAuras.isMacro !== undefined ? newEffect.data.flags.ActiveAuras.isMacro : false;

            newEffect.data.flags.ActiveAuras.isAura = false;
            newEffect.data.flags.ActiveAuras.applied = true;
            newEffect.data.flags.ActiveAuras.isMacro = macro;
            newEffect.data.flags.ActiveAuras.ignoreSelf = false;
            effectArray.push(newEffect)
        }
    }
    return effectArray
}

function RetrieveDrawingAuras(effectArray) {
    if (!effectArray) effectArray = AuraMap.get(canvas.scene._id)?.effects;
    let auraDrawings = canvas.drawings.placeables.filter(i => i.data.flags?.ActiveAuras?.IsAura !== undefined)

    for (let drawing of auraDrawings) {
        for (let testEffect of drawing.data.flags?.ActiveAuras?.IsAura) {
            if (testEffect.disabled) continue;
            let newEffect = { data: duplicate(testEffect), parentActorId: false, parentActorLink: false, entityType: "drawing", entityId: drawing.id, }
            const parts = testEffect.origin.split(".")
            const [entityName, entityId, embeddedName, embeddedId] = parts;
            let actor = game.actors.get(entityId)
            if (!!actor) {
                let rollData = actor.getRollData()
                for (let change of newEffect.data.changes) {
                    if (typeof change.value !== "string") continue
                    let re = /@[\w\.]+/g
                    let s = change.value
                    for (let match of s.match(re) || []) s = s.replace(match, getProperty(rollData, match.slice(1)))
                    change.value = s
                    if (change.key === "macro.execute" || change.key === "macro.itemMacro") newEffect.data.flags.ActiveAuras.isMacro = true
                }
            }
            newEffect.disabled = false
            let macro = newEffect.data.flags.ActiveAuras.isMacro !== undefined ? newEffect.data.flags.ActiveAuras.isMacro : false;

            newEffect.data.flags.ActiveAuras.isAura = false;
            newEffect.data.flags.ActiveAuras.applied = true;
            newEffect.data.flags.ActiveAuras.isMacro = macro;
            newEffect.data.flags.ActiveAuras.ignoreSelf = false;
            effectArray.push(newEffect)
        }
    }
    return effectArray
}