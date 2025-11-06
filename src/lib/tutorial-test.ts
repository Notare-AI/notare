import { createTutorialCanvasContent } from './tutorial';

// Test function to validate tutorial content structure
export const testTutorialContent = () => {
  const { nodes, edges } = createTutorialCanvasContent();
  
  console.log('🧪 Testing Tutorial Canvas Content:');
  console.log(`- Nodes: ${nodes.length}`);
  console.log(`- Edges: ${edges.length}`);
  
  // Validate nodes structure
  nodes.forEach((node, index) => {
    if (!node.id || !node.type || !node.position || !node.data?.content) {
      console.error(`❌ Invalid node at index ${index}:`, node);
      return;
    }
    console.log(`✅ Node ${index + 1}: ${node.id} (${node.data.color || 'no-color'})`);
  });
  
  // Validate edges structure  
  edges.forEach((edge, index) => {
    if (!edge.id || !edge.source || !edge.target || !edge.type) {
      console.error(`❌ Invalid edge at index ${index}:`, edge);
      return;
    }
    console.log(`✅ Edge ${index + 1}: ${edge.source} → ${edge.target}`);
  });
  
  // Check if all edge sources and targets exist as nodes
  const nodeIds = new Set(nodes.map(n => n.id));
  edges.forEach(edge => {
    if (!nodeIds.has(edge.source)) {
      console.error(`❌ Edge source "${edge.source}" not found in nodes`);
    }
    if (!nodeIds.has(edge.target)) {
      console.error(`❌ Edge target "${edge.target}" not found in nodes`);
    }
  });
  
  console.log('🎉 Tutorial content validation complete!');
  return { nodes, edges };
};

// Uncomment to run test when imported
// testTutorialContent();