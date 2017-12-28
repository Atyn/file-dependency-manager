export default function (babel) {
	const { types: t } = babel

	return {
		visitor: {
			Program(path) {
				path.traverse({
					ExpressionStatement(a) {
						if (a.parent !== path.node) {
							return
						}
						a.traverse({
							CallExpression(b) {
								if (b.parent !== a.node) {
									return
								}
								b.traverse({
									FunctionExpression(c) {
										if (c.parent !== b.node) {
											return
										}
										a.replaceWithMultiple(c.node.body.body)
									},
								})
							},
						})
					},
				})
			},
		},
	}
}
