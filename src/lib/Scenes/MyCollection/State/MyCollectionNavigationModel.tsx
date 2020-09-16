import { Action, action, Thunk, thunk, ThunkOn, thunkOn } from "easy-peasy"
import SwitchBoard from "lib/NativeModules/SwitchBoard"
import { AppStoreModel } from "lib/store/AppStoreModel"
import { isEmpty } from "lodash"
import { RefObject } from "react"
import { NavigatorIOS } from "react-native"
import { AddArtworkTitleAndYear } from "../Screens/AddArtwork/Screens/AddArtworkTitleAndYear"
import { AdditionalDetails } from "../Screens/AddArtwork/Screens/AdditionalDetails"
import { AddArtworkAddPhotos } from "../Screens/AddArtwork/Screens/AddPhotos"
import { MyCollectionArtworkMetaFragmentContainer as ArtworkMeta } from "../Screens/ArtworkDetail/Components/MyCollectionArtworkMeta"

type ModalType = "add" | "edit" | null

export interface MyCollectionNavigationModel {
  sessionState: {
    modalType: ModalType
    navViewRef: RefObject<any>
    navigator: NavigatorIOS | null
  }

  setupNavigation: Action<
    MyCollectionNavigationModel,
    {
      navViewRef: RefObject<any>
    }
  >

  setNavigator: Action<MyCollectionNavigationModel, NavigatorIOS>

  goBack: Action<MyCollectionNavigationModel>

  // Modals
  setModalType: Action<MyCollectionNavigationModel, ModalType>
  dismissModal: Action<MyCollectionNavigationModel>

  // Listeners
  onAddArtworkComplete: ThunkOn<MyCollectionNavigationModel, {}, AppStoreModel>
  onStartEditingArtwork: ThunkOn<MyCollectionNavigationModel, {}, AppStoreModel>
  onEditArtworkComplete: ThunkOn<MyCollectionNavigationModel, {}, AppStoreModel>
  onDeleteArtworkComplete: ThunkOn<MyCollectionNavigationModel, {}, AppStoreModel>

  // Nav actions
  navigateToAddArtwork: Action<MyCollectionNavigationModel>
  navigateToAddArtworkPhotos: Thunk<MyCollectionNavigationModel, any, any, AppStoreModel>
  navigateToAddTitleAndYear: Action<MyCollectionNavigationModel>
  navigateToAddAdditionalDetails: Action<MyCollectionNavigationModel>
  navigateToArtworkDetail: Action<MyCollectionNavigationModel, string>
  navigateToViewAllArtworkDetails: Action<MyCollectionNavigationModel, { passProps: any }> // FIXME: any
  navigateToArtworkList: Action<MyCollectionNavigationModel>
  navigateToHome: Action<MyCollectionNavigationModel>
  navigateToMarketingHome: Action<MyCollectionNavigationModel>

  // External app locations
  navigateToConsign: Action<MyCollectionNavigationModel>
  navigateToArtist: Action<MyCollectionNavigationModel>
}

export const MyCollectionNavigationModel: MyCollectionNavigationModel = {
  sessionState: {
    modalType: null,
    navViewRef: { current: null },
    navigator: null,
  },

  setupNavigation: action((state, { navViewRef }) => {
    if (!state.sessionState.navViewRef.current) {
      state.sessionState.navViewRef = navViewRef
    }
  }),

  setNavigator: action((state, navigator) => {
    state.sessionState.navigator = navigator
  }),

  goBack: action(state => {
    state.sessionState.navigator?.pop()
  }),

  setModalType: action((state, payload) => {
    state.sessionState.modalType = payload
  }),

  dismissModal: action(state => {
    state.sessionState.modalType = null
  }),

  /**
   * Listeners
   */

  onAddArtworkComplete: thunkOn(
    (_, storeActions) => storeActions.myCollection.artwork.addArtworkComplete,
    actions => {
      // const artworkId = getStoreState().myCollection.artwork.sessionState.artworkId

      // FIXME: Reenable transition
      // actions.artworkDetail(artworkId)

      setTimeout(() => {
        actions.dismissModal()
      })
    }
  ),

  onStartEditingArtwork: thunkOn(
    (_, storeActions) => storeActions.myCollection.artwork.startEditingArtwork,
    actions => {
      actions.setModalType("edit")
    }
  ),

  onEditArtworkComplete: thunkOn(
    (_, storeActions) => storeActions.myCollection.artwork.editArtworkComplete,
    actions => {
      actions.dismissModal()
    }
  ),

  onDeleteArtworkComplete: thunkOn(
    (_, storeActions) => storeActions.myCollection.artwork.deleteArtworkComplete,
    (actions, {}, { getState }) => {
      actions.dismissModal()

      // Need to wait a bit, because when we dismiss the VC the modal gets unmounted
      // leading to a invalid setState error.
      setTimeout(() => {
        SwitchBoard.dismissNavigationViewController(getState().sessionState.navViewRef.current)
      }, 300)
    }
  ),

  /**
   * Nav Actions
   */

  navigateToAddArtwork: action(state => {
    state.sessionState.modalType = "add"

    // FIXME: Remove from AppRegistry / ARNavigation / delete files
    // SwitchBoard.presentModalViewController(state.navViewRef.current, "/my-collection/add-artwork")
  }),

  navigateToAddArtworkPhotos: thunk((_actions, _payload, { getState, getStoreState, getStoreActions }) => {
    const { navigator } = getState().sessionState
    const { artwork: artworkState } = getStoreState().myCollection
    const { artwork: artworkActions } = getStoreActions().myCollection

    if (isEmpty(artworkState.sessionState.formValues.photos)) {
      artworkActions.takeOrPickPhotos()
    } else {
      navigator?.push({
        component: AddArtworkAddPhotos,
      })
    }
  }),

  navigateToAddTitleAndYear: action(state => {
    state.sessionState.navigator?.push({
      component: AddArtworkTitleAndYear,
    })
  }),

  navigateToAddAdditionalDetails: action(state => {
    state.sessionState.navigator?.push({
      component: AdditionalDetails,
    })
  }),

  navigateToArtworkDetail: action((state, artworkID) => {
    SwitchBoard.presentNavigationViewController(
      state.sessionState.navViewRef.current,
      `/my-collection/artwork-detail/${artworkID}`
    )
  }),

  navigateToViewAllArtworkDetails: action((state, { passProps }) => {
    state.sessionState.navigator?.push({
      component: ArtworkMeta,
      passProps,
    })
  }),

  navigateToArtworkList: action(state => {
    SwitchBoard.presentNavigationViewController(state.sessionState.navViewRef.current, "/my-collection/artwork-list")
  }),

  navigateToMarketingHome: action(state => {
    SwitchBoard.presentNavigationViewController(state.sessionState.navViewRef.current, "/my-collection/marketing-home")
  }),

  navigateToHome: action(state => {
    SwitchBoard.presentNavigationViewController(state.sessionState.navViewRef.current, "/my-collection/home")
  }),

  /**
   * External app navigtion
   */

  navigateToConsign: action(state => {
    SwitchBoard.presentModalViewController(
      state.sessionState.navViewRef.current,
      "/collections/my-collection/artworks/new/submissions/new"
    )
  }),

  navigateToArtist: action(state => {
    SwitchBoard.presentModalViewController(state.sessionState.navViewRef.current, "/artist/cindy-sherman")
  }),
}
