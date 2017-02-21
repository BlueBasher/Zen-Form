import * as React from "react";
import * as ReactDOM from "react-dom";
import {
    IPageForm,
    IPageColumn,
    IPageGroup,
    IPageControl,
    IFieldDefinitions,
    IFieldValues
} from "./pageContracts";
import { FieldType } from "TFS/WorkItemTracking/Contracts";
import { TextField } from "OfficeFabric/components/TextField/TextField";
import { Label } from "OfficeFabric/components/Label/Label";
import { PrimaryButton } from "OfficeFabric/components/Button/PrimaryButton/PrimaryButton";


class PageControl extends React.Component<{
    control: IPageControl,
    definitions: IFieldDefinitions,
    values: IFieldValues
}, void> {
    static counter = 0;
    render() {
        let controlValue: JSX.Element;

        const referenceName = this.props.control.referenceName;
        const field = this.props.definitions[referenceName]
        const fieldValue = this.props.values[referenceName];
        const fieldType = field && field.type;
        const helpText = field && field.helpText;
        const labelText = this.props.control.label;
        switch (fieldType) {
            case FieldType.String:
            controlValue = <TextField
                className="control-value"
                value={fieldValue as string}
                label={labelText}
                title={helpText} />;
            break;
            case FieldType.Html:
            controlValue = <div className="control-value">
                <Label title={helpText}>{labelText}</Label>
                <div className="html-value"
                    contentEditable={true}
                    dangerouslySetInnerHTML={{ __html: fieldValue as string }}></div>
            </div>;
            break;
            case FieldType.Integer:
            controlValue = <TextField
                className="control-value"
                value={typeof fieldValue === undefined || fieldValue === null ? "" : String(fieldValue)}
                label={labelText}
                title={helpText}
                onGetErrorMessage={value => value === "" || value.match(/^\d+$/) ? "" : "Value must be a integer"}
            />;
            break;
            case FieldType.Double:
            controlValue = <TextField
                className="control-value"
                value={typeof fieldValue === undefined || fieldValue === null ? "" : String(fieldValue)}
                label={labelText}
                title={helpText}
                onGetErrorMessage={value => value === "" || value.match(/^\d*\.?\d*$/) ? "" : "Value must be a double"}
            />;
            break;
            /**
             * TODO more field types here
             * Types to Support
             * - Combo String
             * - identity
             * - discussion (sort of html)
             * - boolean
             */
            default:
            controlValue = <div className="control-value">
                {`Unable to render field type ${FieldType[fieldType]} (${referenceName})`}
            </div>;
            break;
        }

        return (
            <div className="page-control">
                {controlValue}
            </div>
        );
    }
}

class PageGroup extends React.Component<{
    group: IPageGroup,
    definitions: IFieldDefinitions,
    values: IFieldValues
}, void> {
    render() {
        const groupElems = this.props.group.controls.map(control =>
            <PageControl
                control={control}
                definitions={this.props.definitions}
                values={this.props.values} />);
        if (this.props.group.label) {
            groupElems.unshift(
                <Label className="page-group-label">{this.props.group.label}</Label>
            );
        }
        return (
            <div className="page-group">
                {groupElems}
            </div>
        );
    }
}

class PageColumn extends React.Component<{
    column: IPageColumn,
    definitions: IFieldDefinitions,
    values: IFieldValues
}, void> {
    render() {
        let groups = this.props.column.groups.map(group =>
            <PageGroup
                group={group}
                definitions={this.props.definitions}
                values={this.props.values} />);
        return (
            <div className="page-column">
                {groups}
            </div>
        );
    }
}

class PageForm extends React.Component<{
    form: IPageForm;
    definitions: IFieldDefinitions;
    values: IFieldValues;
    openEditFormDialog: () => void;
}, void> {
    render() {
        let columns = this.props.form.columns.map( column =>
            <PageColumn
                column={column}
                definitions={this.props.definitions}
                values={this.props.values} />
        );
        return (
            <div className="page-form">
                <PageHeader form={this.props.form} openEditFormDialog={this.props.openEditFormDialog}/>
                <div className="page-columns">
                    {columns}
                </div>
            </div>
        );
    }
}

class PageHeader extends React.Component<{
    form: IPageForm;
    openEditFormDialog: () => void;
}, void> {
    render() {
        return (
            <div className="page-header">
                <PrimaryButton
                    className="open-dialog-button"
                    onClick={this.props.openEditFormDialog}>
                        {"Customize Page"}
                </PrimaryButton>
                <div className="feedback">
                    <a href={"https://marketplace.visualstudio.com/items?itemName=ottostreifel.customize-team-form"} target={"_blank"}>Review</a>{" | "}
                    <a href={"https://github.com/ostreifel/zen-form/issues"} target={"_blank"}>Report an issue</a>
                </div>
            </div>
        );
    }
}

export function renderPage(workItemForm: IPageForm,
                           definitions: IFieldDefinitions,
                           values: IFieldValues,
                           openEditFormDialog: () => void) {
    ReactDOM.render(<PageForm
        form={workItemForm}
        definitions={definitions}
        values={values}
        openEditFormDialog={openEditFormDialog} />, document.getElementById("page-wrapper"));
}
