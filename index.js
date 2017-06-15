import FrenetFactory from './meteor-frenet'

if(!Meteor.settings.frenet){
	throw new Meteor.Error('[Frenet]', 'settings.json doesnt contain Frenet configs')
}

Frenet = FrenetFactory(Meteor.settings.frenet.token)
