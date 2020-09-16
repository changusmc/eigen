import { groupBy, mapValues, partition, sortBy } from "lodash"
import { Flex, Join, Separator, Spacer, Text } from "palette"
import React from "react"
import { createFragmentContainer, graphql, QueryRenderer } from "react-relay"

import { MyBids_me } from "__generated__/MyBids_me.graphql"
import { MyBidsQuery } from "__generated__/MyBidsQuery.graphql"

import { StickyTabPage } from "lib/Components/StickyTabPage/StickyTabPage"
import { StickyTabPageScrollView } from "lib/Components/StickyTabPage/StickyTabPageScrollView"
import { defaultEnvironment } from "lib/relay/createEnvironment"
import { extractNodes } from "lib/utils/extractNodes"
import { renderWithPlaceholder } from "lib/utils/renderWithPlaceholder"
import moment from "moment-timezone"
import {
  ActiveLotFragmentContainer as ActiveLot,
  ClosedLotFragmentContainer as ClosedLot,
  MyBidsPlaceholder,
  SaleCardFragmentContainer,
} from "./Components"
import { lotInActiveSale, lotStandingIsClosed } from "./helpers/lotStanding"

export interface MyBidsProps {
  me: MyBids_me
}

class MyBids extends React.Component<MyBidsProps> {
  render() {
    const { me } = this.props
    const lotStandings = extractNodes(me?.auctionsLotStandingConnection)

    const [activeStandings, closedStandings] = partition(
      lotStandings.filter((ls) => !!ls),
      (ls) => lotInActiveSale(ls)
    )

    // group active lot standings by sale id
    const activeBySaleId = groupBy(activeStandings, (ls) => ls?.saleArtwork?.sale?.internalID)

    // sort each group of lot standings by position (lot number)
    const sortedActiveLots = mapValues(activeBySaleId, (lss) => sortBy(lss, (ls) => ls?.saleArtwork?.position!))

    // sort an ordered list of sale ids by their relevant end time
    const sortedSaleIds: string[] = sortBy(Object.keys(sortedActiveLots), (saleId) => {
      const { liveStartAt, endAt } = sortedActiveLots[saleId][0]?.saleArtwork?.sale!
      return moment(liveStartAt || endAt!).unix()
    })

    return (
      <Flex flex={1}>
        <StickyTabPage
          staticHeaderContent={
            <Flex mt={2}>
              <Text variant="mediumText" textAlign="center">
                My Bids
              </Text>
            </Flex>
          }
          tabs={[
            {
              title: `Active`,
              content: (
                <StickyTabPageScrollView data-test-id="active-section">
                  <Spacer my={1} />

                  <Join separator={<Spacer my={1} />}>
                    {sortedSaleIds.map((saleId) => {
                      const activeLotStandings = sortedActiveLots[saleId]
                      const sale = activeLotStandings[0]?.saleArtwork?.sale!
                      return (
                        <SaleCardFragmentContainer key={saleId} sale={sale}>
                          <Join separator={<Separator my={1} />}>
                            {activeLotStandings.map((ls) => {
                              if (ls && sale) {
                                const LotInfoComponent = lotStandingIsClosed(ls) ? ClosedLot : ActiveLot
                                return <LotInfoComponent lotStanding={ls as any} key={ls?.lotState?.internalID} />
                              }
                            })}
                          </Join>
                        </SaleCardFragmentContainer>
                      )
                    })}
                  </Join>
                  <Spacer my={2} />
                </StickyTabPageScrollView>
              ),
            },
            {
              title: `Closed`,
              content: (
                <StickyTabPageScrollView data-test-id="closed-section">
                  <Flex mt={1}>
                    {closedStandings?.map((ls) => {
                      return (
                        !!ls && (
                          <ClosedLot
                            withTimelyInfo
                            data-test-id="closed-sale-lot"
                            lotStanding={ls}
                            key={ls?.lotState?.internalID}
                          />
                        )
                      )
                    })}
                  </Flex>
                  <Spacer my={2} />
                </StickyTabPageScrollView>
              ),
            },
          ]}
        />
      </Flex>
    )
  }
}

const MyBidsContainer = createFragmentContainer(MyBids, {
  me: graphql`
    fragment MyBids_me on Me {
      auctionsLotStandingConnection(first: 25) {
        edges {
          node {
            ...ActiveLot_lotStanding
            ...ClosedLot_lotStanding
            lotState {
              internalID
              saleId
              soldStatus
            }
            saleArtwork {
              position
              sale {
                ...SaleCard_sale
                internalID
                displayTimelyAt
                liveStartAt
                endAt
                status
              }
            }
          }
        }
      }
    }
  `,
})

export const MyBidsQueryRenderer: React.FC = () => (
  <QueryRenderer<MyBidsQuery>
    environment={defaultEnvironment}
    query={graphql`
      query MyBidsQuery {
        me {
          ...MyBids_me
        }
      }
    `}
    render={renderWithPlaceholder({
      Container: MyBidsContainer,
      renderPlaceholder: () => <MyBidsPlaceholder />,
    })}
    variables={{}}
  />
)
