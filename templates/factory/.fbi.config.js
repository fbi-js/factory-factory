module.exports = {
  factory: {
    id: '<%= factory.id %>',
    version: '<%= factory.version %>',
    template: '<%= factory.template %>',
    features: <%- JSON.stringify(project.features) %>
  }
}
