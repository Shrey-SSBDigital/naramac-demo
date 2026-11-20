const { STAKEHOLDERS, WORKFLOW_STEPS } = require('../data/stakeholdersData');

// GET all stakeholders ordered along the supply chain flow
exports.getAllStakeholders = (req, res) => {
  try {
    const list = STAKEHOLDERS.map((s, index) => ({
      id: s.id,
      stepNumber: index + 1,
      roleName: s.roleName,
      category: s.category,
      clusterPresence: s.clusterPresence,
      badgeColor: s.badgeColor,
      icon: s.icon,
      summary: s.description,
      identitiesCount: s.mandatoryIdentitiesHandled.length
    }));

    res.json({
      success: true,
      total: list.length,
      stakeholders: list
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET detailed stakeholder by ID with separated, structured responsibilities
exports.getStakeholderById = (req, res) => {
  try {
    const roleId = req.params.roleId.toUpperCase();
    const stakeholder = STAKEHOLDERS.find(s => s.id === roleId);

    if (!stakeholder) {
      return res.status(404).json({ success: false, message: `Stakeholder ${roleId} not found` });
    }

    const currentIndex = STAKEHOLDERS.findIndex(s => s.id === roleId);
    const prevStakeholder = currentIndex > 0 ? STAKEHOLDERS[currentIndex - 1] : null;
    const nextStakeholder = currentIndex < STAKEHOLDERS.length - 1 ? STAKEHOLDERS[currentIndex + 1] : null;

    // Structured categorization of responsibilities
    const structuredResponsibilities = {
      primaryObjective: stakeholder.description,
      dataCaptureDuties: stakeholder.coreDuties.filter(d => 
        d.toLowerCase().includes('register') || 
        d.toLowerCase().includes('record') || 
        d.toLowerCase().includes('capture') || 
        d.toLowerCase().includes('log') ||
        d.toLowerCase().includes('scan')
      ),
      operationalDuties: stakeholder.coreDuties.filter(d => 
        !d.toLowerCase().includes('register') && 
        !d.toLowerCase().includes('record') && 
        !d.toLowerCase().includes('capture') && 
        !d.toLowerCase().includes('log') &&
        !d.toLowerCase().includes('scan')
      ),
      identitiesGoverned: stakeholder.mandatoryIdentitiesHandled,
      statutoryLimits: stakeholder.regulatoryBoundary,
      upstreamInputs: stakeholder.upstreamDependencies,
      downstreamOutputs: stakeholder.downstreamHandoffs,
      reciprocalInteractions: stakeholder.relationshipWithOthers
    };

    res.json({
      success: true,
      stepNumber: currentIndex + 1,
      totalSteps: STAKEHOLDERS.length,
      stakeholder,
      prevRole: prevStakeholder ? { id: prevStakeholder.id, name: prevStakeholder.roleName } : null,
      nextRole: nextStakeholder ? { id: nextStakeholder.id, name: nextStakeholder.roleName } : null,
      structuredResponsibilities
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET complete flow overview
exports.getSupplyChainFlow = (req, res) => {
  try {
    const flow = STAKEHOLDERS.map((s, idx) => ({
      step: idx + 1,
      id: s.id,
      roleName: s.roleName,
      category: s.category,
      inputsFrom: s.upstreamDependencies.map(u => u.fromRole),
      outputsTo: s.downstreamHandoffs.map(d => d.toRole),
      keyIds: s.mandatoryIdentitiesHandled.map(i => i.code)
    }));

    res.json({
      success: true,
      flow
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
