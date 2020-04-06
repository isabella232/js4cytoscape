
const cxConstants = require('./cxConstants.js');
const cxUtil = require('./cxUtil.js');

function simpleDefaultPropertyConvert(targetStyleField, portablePropertValue) {
    const targetStyleEntry = new Map();
    targetStyleEntry.set(targetStyleField, portablePropertValue);
    return targetStyleEntry;
}

const defaultPropertyConvert = {
    'node': {
        'shape': (portablePropertyValue) => simpleDefaultPropertyConvert('shape', portablePropertyValue),
        'width': (portablePropertyValue) => simpleDefaultPropertyConvert('width', portablePropertyValue),
        'height': (portablePropertyValue) => simpleDefaultPropertyConvert('height', portablePropertyValue),
        'background-color': (portablePropertyValue) => simpleDefaultPropertyConvert('background-color', portablePropertyValue),
        'background-opacity': (portablePropertyValue) => simpleDefaultPropertyConvert('background-opacity', portablePropertyValue),
        'label': (portablePropertyValue) => simpleDefaultPropertyConvert('label', portablePropertyValue),
        'label-color': (portablePropertyValue) => simpleDefaultPropertyConvert('label-color', portablePropertyValue)
    },
    'edge': {
        'width': (portablePropertyValue) => simpleDefaultPropertyConvert('width', portablePropertyValue),
        'opacity': (portablePropertyValue) => simpleDefaultPropertyConvert('opacity', portablePropertyValue),
        'line-color': (portablePropertyValue) => simpleDefaultPropertyConvert('line-color', portablePropertyValue)
    },
}

function simplePassthroughMappingConvert(targetStyleField, attributeName) {
    const output = {};
    output[targetStyleField] = 'data(' + attributeName + ')';
    return output;
}

const passthroughMappingConvert = {
    'node': {
        'shape': (attributeName) => simplePassthroughMappingConvert('shape', attributeName),
        'width': (attributeName) => simplePassthroughMappingConvert('width', attributeName),
        'height': (attributeName) => simplePassthroughMappingConvert('height', attributeName),
        'background-color': (attributeName) => simplePassthroughMappingConvert('background-color', attributeName),
        'background-opacity': (attributeName) => simplePassthroughMappingConvert('background-opacity', attributeName),
        'label': (attributeName) => simplePassthroughMappingConvert('label', attributeName),
        'label-color': (attributeName) => simplePassthroughMappingConvert('label-color', attributeName)
    },
    'edge': {
        'width': (attributeName) => simplePassthroughMappingConvert('width', attributeName),
        'opacity': (attributeName) => simplePassthroughMappingConvert('opacity', attributeName),
        'line-color': (attributeName) => simplePassthroughMappingConvert('line-color', attributeName)
    },
}

function getCSSStyleEntries(cxStyleEntries, entityType) {
    let output = {};
    Object.keys(cxStyleEntries).forEach((key) => {
        const portablePropertyValue = cxStyleEntries[key];
        if (defaultPropertyConvert[entityType][key]) {
            const cssEntries = defaultPropertyConvert[entityType][key](portablePropertyValue);
            cssEntries.forEach((value, key) => {
                output[key] = value;
            });
        }
    });
    return output;
}

function getIdSelector(id, elementType) {
    //node#id or edge#id
    return elementType + '#' + id;
}



function getStyleElement(selector, css) {
    return { 'selector': selector, 'style': css };
}

function getContinuousMappingCSSEntry(portablePropertyKey, cxMappingDefinition, entityType) {
    return {};
}

function getPassthroughMappingCSSEntry(portablePropertyKey, cxMappingDefinition, entityType) {
    if (passthroughMappingConvert[entityType][portablePropertyKey]) {
        const css = passthroughMappingConvert[entityType][portablePropertyKey](cxMappingDefinition.attribute);
        return getStyleElement(entityType, css);
    }
    return null;
}

function getDiscreteSelector(entityType, attributeName, attributeDataType, attributeValue) {
    if (attributeDataType == 'string') {
        return entityType + '[' + attributeName + ' = \'' + attributeValue + '\']';
    } else if (attributeDataType == 'boolean') {

        if (attributeValue == 'true') {
            return entityType + '[?' + attributeName + ']';
        } else {
            return entityType + '[' + attributeName + '][!' + attributeName + ']';
        }
    } else {
        return entityType + '[' + attributeName + ' = ' + attributeValue + ']';
    }
}


function getDiscreteMappingCSSEntry(portablePropertyKey, cxMappingDefinition, entityType) {
    const atttributeToValueMap = cxMappingDefinition['map'];
    const attributeName = cxMappingDefinition['attribute'];
    const attributeDataType = 'string';
    atttributeToValueMap.forEach((discreteMap) => {
        console.log(' discrete map for ' + portablePropertyKey + ': ' + discreteMap.v + ' -> ' + discreteMap.vp);

        const selector = getDiscreteSelector(entityType, attributeName, attributeDataType, discreteMap.v);
        console.log('  selector: ' + selector);
        if (defaultPropertyConvert[entityType][portablePropertyKey]) {
            const styleMap = defaultPropertyConvert[entityType][portablePropertyKey](discreteMap.vp);
            const css = {};
            styleMap.forEach((value, key) => {
                css[key] = value;
            });
            console.log('   style: ' + JSON.stringify(css));
        }
    });


    return null; //getStyleElement(selector, css);
}

/** 
 * 
*/
function getCSSMappingEntries(
    cxMappingEntries,
    entityType,
    attributeTypeMap) {
    let output = [];
    Object.keys(cxMappingEntries).forEach((key) => {
        const cxMappingEntry = cxMappingEntries[key];
        console.log(" mapping type: " + cxMappingEntry.type);
        switch (cxMappingEntry.type) {
            case 'continuous': {

                break;
            }
            case 'passthrough': {
                output.push(getPassthroughMappingCSSEntry(key, cxMappingEntry.definition, entityType));
                break;
            }
            case 'discrete':
                {
                    getDiscreteMappingCSSEntry(key, cxMappingEntry.definition, entityType);
                    break;
                }
        }

    });
    return output;
}

function getVisualProperties(cxVisualProperties, nodeAttributeTypeMap, edgeAttributeTypeMap) {
    let output = {
        style: [],
        'background-color': undefined
    }

    let defaultCSSNodeStyle = undefined;
    let defaultCSSEdgeStyle = undefined;

    let cssNetworkBackgroundColor = undefined;

    let mappingCSSNodeStyle = undefined;
    let mappingCSSEdgeStyle = undefined;

    cxVisualProperties.forEach((vpElement) => {
        const vpAt = vpElement.at;
        if (vpAt === cxConstants.STYLE) {
            const value = vpElement.v;
            const defaultStyles = value.default;

            defaultCSSNodeStyle = getCSSStyleEntries(defaultStyles.node, 'node');
            defaultCSSEdgeStyle = getCSSStyleEntries(defaultStyles.edge, 'edge');

            cssNetworkBackgroundColor = defaultStyles.network['background-color'];

            const nodeMapping = value.nodeMapping;
            mappingCSSNodeStyle = getCSSMappingEntries(nodeMapping, 'node', nodeAttributeTypeMap);

            const edgeMapping = value.edgeMapping;
            mappingCSSEdgeStyle = getCSSMappingEntries(edgeMapping, 'edge', edgeAttributeTypeMap);

        } else if (vpElement == cxConstants.N) {
            //Bypass style node
        } else if (vpElement == cxConstants.E) {
            //Bypass style edge
        }
    })

    //Add default style
    output.style.push(getStyleElement(NODE_SELECTOR, defaultCSSNodeStyle));
    output.style.push(getStyleElement(EDGE_SELECTOR, defaultCSSEdgeStyle));

    output.style.push.apply(output.style, mappingCSSNodeStyle);

    output['background-color'] = cssNetworkBackgroundColor;

    return output;
}

const NODE_SELECTOR = 'node';
const EDGE_SELECTOR = 'edge';

function getData(v, attributeNameMap, attributeDefaultValueMap) {
    let data = {};
    Object.keys(v).forEach((key) => {
        const newKey = attributeNameMap.has(key) ? attributeNameMap.get(key) : key;
        data[newKey] = v[key];
    });
    attributeDefaultValueMap.forEach((value, key) => {
        if (!data[key]) {
            data[key] = value;
        }
    });
    return data;
}

function updateAttributeTypeMap(attributeTypeMap, attributeDeclarations) {
    Object.keys(attributeDeclarations).forEach((attributeName) => {
        const attributeDeclaration = attributeDeclarations[attributeName];
        if (attributeDeclaration['d']) {
            attributeTypeMap.set(attributeName, attributeDeclaration.d);
        }
    });
}

function updateAttributeNameMap(attributeNameMap, attributeDeclarations) {
    Object.keys(attributeDeclarations).forEach((attributeName) => {
        const attributeDeclaration = attributeDeclarations[attributeName];
        if (attributeDeclaration['a']) {
            console.log('attribute ' + attributeDeclaration.a + ' should be renamed to ' + attributeName);
            attributeNameMap.set(attributeDeclaration.a, attributeName);
        }
    });
}

function updateAttributeDefaultValueMap(attributeDefaultValueMap, attributeDeclarations) {
    Object.keys(attributeDeclarations).forEach((attributeName) => {
        const attributeDeclaration = attributeDeclarations[attributeName];
        if (attributeDeclaration['v']) {
            console.log('attribute ' + attributeName + ' has default value ' + attributeDeclaration.v);
            attributeDefaultValueMap.set(attributeName, attributeDeclaration.v);
        }
    });
}

const converter = {
    targetFormat: 'cytoscapeJS',
    convert: (cx) => {
        const output = {
            style: [],
            elements: {},
            layout: {},
            'background-color': null
        }

        let nodeMap = new Map();
        let edgeMap = new Map();

        let cxAttributeDeclarations = undefined;
        let cxVisualProperties = undefined;

        let nodeAttributeTypeMap = new Map();
        let edgeAttributeTypeMap = new Map();

        let nodeAttributeNameMap = new Map();
        let edgeAttributeNameMap = new Map();

        let nodeAttributeDefaultValueMap = new Map();
        let edgeAttributeDefaultValueMap = new Map();

        let updateInferredTypes = function (attributeTypeMap, attributeNameMap, v) {
            Object.keys(v).forEach((key) => {
                if (!attributeTypeMap.has(key)) {
                    const value = v[key];
                    const inferredType = typeof value;
                    const newKey = attributeNameMap.has(key) ? attributeNameMap.get(key) : key;
                    attributeTypeMap.set(newKey, inferredType);
                }
            })
        }

        cx.forEach((cxAspect) => {
            if (cxAspect['attributeDeclarations']) {
                cxAttributeDeclarations = cxAspect['attributeDeclarations'];
                console.log(" cxAttributeDeclarations: " + JSON.stringify(cxAttributeDeclarations, null, 2));
                cxAttributeDeclarations.forEach((cxAttributeDeclaration) => {
                    if (cxAttributeDeclaration['nodes']) {
                        updateAttributeNameMap(nodeAttributeNameMap, cxAttributeDeclaration.nodes);
                        updateAttributeTypeMap(nodeAttributeTypeMap, cxAttributeDeclaration.nodes);
                        updateAttributeDefaultValueMap(nodeAttributeDefaultValueMap, cxAttributeDeclaration.nodes);
                    }
                    if (cxAttributeDeclaration['edges']) {
                        updateAttributeNameMap(edgeAttributeNameMap, cxAttributeDeclaration.edges);
                        updateAttributeTypeMap(edgeAttributeTypeMap, cxAttributeDeclaration.edges);
                        updateAttributeDefaultValueMap(edgeAttributeDefaultValueMap, cxAttributeDeclaration.edges);
                    }
                });
            } else if (cxAspect['nodes']) {
                const cxNodes = cxAspect['nodes'];
                cxNodes.forEach((cxNode) => {
                    const cxId = cxNode['id'].toString();
                    nodeMap.set(cxId, {
                        id: cxNode['id'],
                        v: cxNode['v'],
                        layout: {
                            x: cxNode['x'],
                            y: cxNode['y'],
                            z: cxNode['z']
                        }
                    });
                    updateInferredTypes(nodeAttributeTypeMap, nodeAttributeNameMap, cxNode['v']);
                });
            } else if (cxAspect['edges']) {
                const cxEdges = cxAspect['edges'];
                cxEdges.forEach((cxEdge) => {
                    const cxId = cxEdge['id'].toString();
                    edgeMap.set(cxId, {
                        id: cxEdge['id'],
                        v: cxEdge['v'],
                        s: cxEdge['s'],
                        t: cxEdge['t']
                    });
                    updateInferredTypes(edgeAttributeTypeMap, edgeAttributeNameMap, cxEdge['v']);
                });
            } else if (cxAspect['visualProperties']) {
                cxVisualProperties = cxAspect['visualProperties'];
            }
        });

        nodeAttributeTypeMap.forEach((inferredType, attributeName) => {
            console.log('inferred attribute type for node.' + attributeName + ': ' + inferredType);
        });

        edgeAttributeTypeMap.forEach((inferredType, attributeName) => {
            console.log('inferred attribute type for edge.' + attributeName + ': ' + inferredType);
        });

        //Add nodes
        output.elements['nodes'] = [];
        output.elements['edges'] = [];
        nodeMap.forEach((cxNode, key) => {
            const element = {};
            element['data'] = getData(cxNode.v, nodeAttributeNameMap, nodeAttributeDefaultValueMap);
            element['data']['id'] = cxNode.id;
            element['position'] = {
                x: cxNode.layout.x,
                y: cxNode.layout.y
            }

            output.elements.nodes.push(element)
        });

        //Add edges
        output.elements['edges'] = [];
        edgeMap.forEach((cxEdge, key) => {
            const element = {};
            element['data'] = getData(cxEdge.v, edgeAttributeNameMap, edgeAttributeDefaultValueMap);
            element['data']['id'] = cxEdge.id;
            element['data']['source'] = cxEdge.s;
            element['data']['target'] = cxEdge.t;
            output.elements.edges.push(element)
        });

        const style = getVisualProperties(cxVisualProperties, cxAttributeDeclarations);

        output.style = style.style;
        output['background-color'] = style['background-color'];

        return output;
    }
}

module.exports = {
    converter: converter
};