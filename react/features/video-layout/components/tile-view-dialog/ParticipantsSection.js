// @flow

import React, { PureComponent } from 'react';

import { translate } from '../../../base/i18n';
import { participantUpdated, getEveryone, isLocalParticipantModerator } from '../../../base/participants';
import { Switch } from '../../../base/react';
import { connect } from '../../../base/redux';
import { toggleParticipant } from '../../actions';
import { toggleTileView, shouldDisplayTileView } from '../../../video-layout'

type Props = {

    /**
     * True if lobby is currently enabled in the conference.
     */
    _lobbyEnabled: boolean,
    /**
     * True if the section should be participants.
     */
    _participants: Object,
/**
     * True if the section should be participants.
     */
    _participantsToChange: Object,
    /**
     * True if the section should be visible.
     */
    _visible: boolean,

    /**
     * The Redux Dispatch function.
     */
    dispatch: Function,

    /**
     * Whether or not the tile view is enabled.
     */
    _tileViewEnabled: boolean,

    /**
     * Function to be used to translate i18n labels.
     */
    t: Function
};

type State = {

    /**
     * True if the lobby switch is toggled on.
     */
    lobbyEnabled: boolean,
    participantsToChange: object
}

/**
 * Implements a security feature section to control lobby mode.
 */
class ParticipantsSection extends PureComponent<Props, State> {
    /**
     * Instantiates a new component.
     *
     * @inheritdoc
     */
    constructor(props: Props) {
        super(props);

        this.state = {
            lobbyEnabled: props._lobbyEnabled,
            participantsToChange: props._participantsToChange
        };
        this._onToggleItem = this._onToggleItem.bind(this);
        this._onToggleLobby = this._onToggleLobby.bind(this);
        this._onToggleTileView = this._onToggleTileView.bind(this);
        this._onToggleTileViewUpdate = this._onToggleTileViewUpdate.bind(this);
    }

    /**
     * Implements React's {@link Component#getDerivedStateFromProps()}.
     *
     * @inheritdoc
     */
    static getDerivedStateFromProps(props: Props, state: Object) {
        if (props._lobbyEnabled !== state.lobbyEnabled) {

            return {
                lobbyEnabled: props._lobbyEnabled
            };
        }

        return null;
    }

    /**
     * Implements {@code PureComponent#render}.
     *
     * @inheritdoc
     */
    render() {
        const { participantsToChange } = this.state;

        return (
            <>
                <div id = 'tileparticipants-section'>
                    <p className = 'description'>
                        Select the users you want to be visible on the Screen
                    </p>
                    <div className = 'separator-line' />
                    <div className = 'control-row'>
                        { participantsToChange.map((value, index) => {
                            return (<>
                            <Switch id = {value.id}
                                onValueChange = {this._onToggleItem(value.id)} 
                                value = {!value.isFakeParticipant} />
                            <label htmlFor = {value.id}>{value.name}</label>
                                </>)
                        })}
                    </div>
                    <div className = 'separator-line' />
                    <div className = 'tilebutton'>
                        <a className='button button--small' onClick = { this._onToggleTileViewUpdate }>Update Participants!</a>
                        <a className='button button--small' onClick = { this._onToggleTileView }>{this.props._tileViewEnabled ? 'Deactivate Tile View!' : 'Activate Tile View!'}</a>
                    </div>
                </div>
                <div className = 'separator-line' />
            </>
        );
    }
    

    _onToggleTileView: () => void;
    
    _onToggleTileView() {
        this.props.dispatch(toggleTileView());
    }

    _onToggleTileViewUpdate: () => void;
    
    _onToggleTileViewUpdate() {
        this.state.participantsToChange.map(participant => {
            this.props.dispatch(participantUpdated({
                conference: participant.conference,
                id: participant.id,
                isFakeParticipant: participant.isFakeParticipant,
            }));
        })
        
    }
    _onToggleItem: (id: string) => void;

    _onToggleItem(id: string) {
        const index = this.state.participantsToChange.findIndex(p => p.id === id);
        let participantsUpdated = this.state.participantsToChange;
        participantsUpdated[index].isFakeParticipant = !(participantsUpdated[index].isFakeParticipant);  
        
        this.setState({
            participantsToChange: participantsUpdated
        });
    }
    _onToggleLobby: () => void;

    /**
     * Callback to be invoked when the user toggles the lobby feature on or off.
     *
     * @returns {void}
     */
    _onToggleLobby() {
        const newValue = !this.state.lobbyEnabled;

        this.setState({
            lobbyEnabled: newValue
        });

        this.props.dispatch(toggleParticipant(newValue));
    }
}

/**
 * Maps part of the Redux state to the props of this component.
 *
 * @param {Object} state - The Redux state.
 * @returns {Props}
 */

function mapStateToProps(state: Object): $Shape<Props> {
    const { conference } = state['features/base/conference'];
    const { hideLobbyButton } = state['features/base/config'];
    const participants = getEveryone(state); //participants that were selected

    return {
        _lobbyEnabled: state['features/lobby'].lobbyEnabled,
        _visible: conference && conference.isLobbySupported() && isLocalParticipantModerator(state)
            && !hideLobbyButton,
        _participants: participants,
        _tileViewEnabled: shouldDisplayTileView(state),
        _participantsToChange: participants
    };
}

export default translate(connect(mapStateToProps)(ParticipantsSection));
