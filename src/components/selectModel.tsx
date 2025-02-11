
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AVAILABLE_MODELS, Model, ModelProvider, useModelStore } from "@/store/modelStore";

const SelectModel = () => {
    const { selectedModel, setModel } = useModelStore();

    const groupedModels = AVAILABLE_MODELS.reduce((acc, model) => {
        if (!acc[model.provider]) {
            acc[model.provider] = [];
        }
        acc[model.provider].push(model);
        return acc;
    }, {} as Record<ModelProvider, Model[]>);

    return (

        <Select value={selectedModel.id} onValueChange={(value) => {
            const model = AVAILABLE_MODELS.find(m => m.id === value);
            if (model) setModel(model);
        }}>
            <SelectTrigger className="w-[280px]">
                <SelectValue>{selectedModel.name}</SelectValue>
            </SelectTrigger>
            <SelectContent>
                {Object.entries(groupedModels).map(([provider, models]) => (
                    <SelectGroup key={provider}>
                        <SelectLabel>{provider.charAt(0).toUpperCase() + provider.slice(1)}</SelectLabel>
                        {models.map((model) => (
                            <SelectItem key={model.id} value={model.id}>
                                {model.name}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                ))}
            </SelectContent>
        </Select>
    )
}


export default SelectModel;