import { Input } from "lib/Components/Input/Input"
import { Select } from "lib/Components/Select"
import { useArtworkForm } from "lib/Scenes/MyCollection/Screens/AddArtwork/Form/useArtworkForm"
import { Flex, Sans, space, Spacer } from "palette"
import React, { useRef } from "react"

export const Dimensions: React.FC = () => {
  const { formik } = useArtworkForm()
  const metricInputRef = useRef<Select<Metric>>(null)

  return (
    <>
      <Flex flexDirection="row">
        <Sans size="3" weight="medium">
          Dimensions
        </Sans>
        <Sans size="3" ml="2px">
          (optional)
        </Sans>
      </Flex>
      <Spacer my={0.5} />
      <Flex flexDirection="row">
        <Input
          placeholder="Height"
          onChangeText={formik.handleChange("height")}
          onBlur={formik.handleBlur("height")}
          defaultValue={formik.values.height}
          style={{ marginRight: space(1) }}
        />
        <Input
          placeholder="Width"
          onChangeText={formik.handleChange("width")}
          onBlur={formik.handleBlur("width")}
          defaultValue={formik.values.width}
          style={{ marginRight: space(1) }}
        />
        <Input
          placeholder="Depth"
          onChangeText={formik.handleChange("depth")}
          onBlur={formik.handleBlur("depth")}
          defaultValue={formik.values.depth}
        />
      </Flex>
      <Spacer my={1} />
      <Select
        ref={metricInputRef}
        onSelectValue={(value) => {
          formik.handleChange("metric")(value)
        }}
        value={formik.values.metric}
        enableSearch={false}
        title="Metric"
        showTitleLabel={false}
        placeholder="Metric"
        options={metricSelectOptions}
      />
    </>
  )
}

export type Metric = "in" | "cm" | ""

interface MetricSelectOption {
  label: string
  value: Metric
}

const metricSelectOptions: MetricSelectOption[] = [
  { label: "Inches", value: "in" },
  { label: "Centimeters", value: "cm" },
]
